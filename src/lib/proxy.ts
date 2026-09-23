const defaultUpstream = "https://raileurope.wl.omio.com";
const hopByHop = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

function stripHopHeaders(headers: Headers) {
  const nominated = headers.get("connection")?.split(",") ?? [];
  for (const name of [...hopByHop, ...nominated]) headers.delete(name.trim());
}

export function rewriteText(
  text: string,
  upstream: string,
  publicOrigin: string,
): string {
  const escape = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match whole origins only, including JSON's optional escaped slashes.
  for (const [source, target] of [
    [upstream, publicOrigin],
    [upstream.replaceAll("/", "\\/"), publicOrigin.replaceAll("/", "\\/")],
    [upstream.replace(/^https?:/, ""), publicOrigin.replace(/^https?:/, "")],
  ]) {
    text = text.replace(
      new RegExp(`${escape(source)}(?=[/\\\\?#"'\\s<>]|$)`, "g"),
      () => target,
    );
  }
  return text;
}

export function rewriteLocation(
  value: string,
  upstream: string,
  publicOrigin: string,
): string {
  try {
    const url = new URL(value, upstream);
    if (url.origin === upstream)
      return `${publicOrigin}${url.pathname}${url.search}${url.hash}`;
  } catch {
    /* Preserve malformed upstream headers instead of failing the response. */
  }
  return value;
}

export function rewriteCookie(
  cookie: string,
  upstreamHost: string,
): string | null {
  const domain = /;\s*domain=([^;]+)/i
    .exec(cookie)?.[1]
    .trim()
    .replace(/^\./, "")
    .toLowerCase();
  if (!domain) return cookie;
  // A browser would reject unrelated domains. Do not turn their deletion cookies
  // into host cookies: upstream sends these for other Omio environments.
  if (upstreamHost !== domain && !upstreamHost.endsWith(`.${domain}`))
    return null;
  return cookie.replace(/;\s*domain=[^;]+/i, "");
}

export async function proxyRequest(request: Request): Promise<Response> {
  const incoming = new URL(request.url);
  // Omio's result-card navigation treats localhost as its own dev server and
  // omits the app prefix. Restore the production route for local POC navigation.
  const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(
    incoming.hostname,
  );
  if (
    localHost &&
    /^\/journey\/(train|bus|flight|ferry)\//.test(incoming.pathname)
  ) {
    const destination = new URL(incoming);
    destination.pathname = `/app/search-frontend${incoming.pathname}`;
    return new Response(null, {
      status: 307,
      headers: { location: destination.href, "cache-control": "no-store" },
    });
  }

  if (
    incoming.pathname.startsWith("/_next/") ||
    ["/blog", "/imprint", "/diagram", "/integration-overview", "/"].includes(
      incoming.pathname.replace(/\/$/, "") || "/",
    )
  ) {
    return new Response("Not found", { status: 404 });
  }
  const upstream = new URL(process.env.OMIO_UPSTREAM_ORIGIN || defaultUpstream);
  if (
    upstream.protocol !== "https:" ||
    upstream.username ||
    upstream.password ||
    upstream.pathname !== "/" ||
    upstream.search ||
    upstream.hash
  ) {
    return new Response("Invalid upstream configuration", { status: 500 });
  }
  // Assign path rather than resolving it: //evil.example must never change origin.
  const target = new URL(upstream.origin);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  const headers = new Headers(request.headers);
  stripHopHeaders(headers);
  for (const key of [...headers.keys()]) {
    if (
      key.startsWith("x-forwarded-") ||
      key.startsWith("x-vercel-") ||
      key.startsWith("x-middleware-") ||
      key.startsWith("next-") ||
      ["host", "content-length", "forwarded", "rsc"].includes(key)
    )
      headers.delete(key);
  }
  // This marker identifies the approved proxy to Omio's Cloudflare rule.
  // Keep it server-only and never send it to another configured upstream.
  const wafMarker = process.env.OMIO_WAF_USER_AGENT_MARKER?.trim();
  if (upstream.origin === defaultUpstream && wafMarker) {
    const userAgent = headers.get("user-agent") || "RailEuropePOC/1.0";
    headers.set("user-agent", `${userAgent} ${wafMarker}`);
  }
  headers.set("accept-encoding", "identity");
  for (const name of ["origin", "referer"]) {
    const value = headers.get(name);
    if (value)
      headers.set(name, rewriteText(value, incoming.origin, upstream.origin));
  }
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(45_000)]),
    });
    const outgoing = new Headers(response.headers);
    stripHopHeaders(outgoing);
    // Fetch decompresses bodies. Never retain the original wire length/encoding.
    for (const name of [
      "content-encoding",
      "content-length",
      "set-cookie",
      "etag",
      "content-md5",
      "content-digest",
    ])
      outgoing.delete(name);
    outgoing.set("cache-control", "private, no-store");
    outgoing.set("cdn-cache-control", "no-store");
    outgoing.set("vercel-cdn-cache-control", "no-store");
    for (const cookie of response.headers.getSetCookie()) {
      const rewritten = rewriteCookie(cookie, upstream.hostname);
      if (rewritten) outgoing.append("set-cookie", rewritten);
    }
    for (const name of ["location", "content-location"]) {
      const value = outgoing.get(name);
      if (value)
        outgoing.set(
          name,
          rewriteLocation(value, upstream.origin, incoming.origin),
        );
    }
    for (const name of [
      "content-security-policy",
      "content-security-policy-report-only",
      "access-control-allow-origin",
      "refresh",
      "link",
    ]) {
      const value = outgoing.get(name);
      if (value)
        outgoing.set(
          name,
          rewriteText(value, upstream.origin, incoming.origin),
        );
    }
    const noBody =
      request.method === "HEAD" || [204, 205, 304].includes(response.status);
    const contentType = outgoing.get("content-type") || "";
    const textual =
      /^(text\/|application\/(?:json|[^;]+\+json|javascript|x-javascript|xml|[^;]+\+xml))/i.test(
        contentType,
      );
    const body = noBody
      ? null
      : textual
        ? rewriteText(await response.text(), upstream.origin, incoming.origin)
        : response.body;
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: outgoing,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return Response.json(
      {
        error: timedOut
          ? "Omio took too long to respond. Please try again."
          : "Unable to reach Omio. Please try again.",
      },
      {
        status: timedOut ? 504 : 502,
        headers: { "cache-control": "no-store" },
      },
    );
  }
}
