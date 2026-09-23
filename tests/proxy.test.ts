import { test } from "node:test";
import assert from "node:assert/strict";
import {
  proxyRequest,
  rewriteCookie,
  rewriteLocation,
  rewriteText,
} from "../src/lib/proxy";
const upstream = "https://raileurope.wl.omio.com";
const local = "http://localhost:3000";
test("rewrites absolute/relative redirects but leaves external destinations", () => {
  assert.equal(
    rewriteLocation(`${upstream}/app/a?x=1#top`, upstream, local),
    `${local}/app/a?x=1#top`,
  );
  assert.equal(rewriteLocation("/app/a", upstream, local), `${local}/app/a`);
  assert.equal(
    rewriteLocation("https://payments.example/a", upstream, local),
    "https://payments.example/a",
  );
});
test("rewrites exact origins in JSON, HTML, and escaped JSON without touching other hosts", () => {
  const input = JSON.stringify({ redirect_url: `${upstream}/app/a?x=1&y=2` });
  assert.equal(
    JSON.parse(rewriteText(input, upstream, local)).redirect_url,
    `${local}/app/a?x=1&y=2`,
  );
  const escaped = input.replaceAll("/", "\\/");
  assert.equal(
    JSON.parse(rewriteText(escaped, upstream, local)).redirect_url,
    `${local}/app/a?x=1&y=2`,
  );
  assert.equal(
    rewriteText(`${upstream}.evil/app`, upstream, local),
    `${upstream}.evil/app`,
  );
  assert.equal(
    rewriteText(`<a href="${upstream}/app">`, upstream, local),
    `<a href="${local}/app">`,
  );
});
test("cookies become host-only while retaining flags and expiry; unrelated domains are dropped", () => {
  const flags =
    "; Path=/; Secure; HttpOnly; SameSite=None; Expires=Wed, 23 Sep 2026 15:00:00 GMT";
  assert.equal(
    rewriteCookie(
      `session=abc; Domain=.omio.com${flags}`,
      "raileurope.wl.omio.com",
    ),
    `session=abc${flags}`,
  );
  assert.equal(
    rewriteCookie(`session=abc${flags}`, "raileurope.wl.omio.com"),
    `session=abc${flags}`,
  );
  assert.equal(
    rewriteCookie("session=; Domain=goeuro.ninja", "raileurope.wl.omio.com"),
    null,
  );
});
test("proxy forwards path, duplicate query, POST body, and cookies; rewrites response without caching", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
    assert.equal(url.href, `${upstream}/app/api/book?x=1&x=2`);
    assert.equal(init.method, "POST");
    assert.equal(
      new TextDecoder().decode(init.body as ArrayBuffer),
      '{"id":42}',
    );
    const headers = new Headers(init.headers);
    assert.equal(headers.get("cookie"), "session=abc");
    assert.equal(headers.get("origin"), upstream);
    assert.equal(headers.get("x-forwarded-host"), null);
    assert.equal(headers.get("x-private"), null);
    assert.equal(init.redirect, "manual");
    const response = new Response(
      JSON.stringify({ redirect_url: `${upstream}/app/results` }),
      {
        headers: {
          "content-type": "application/json",
          "content-length": "999",
          etag: "old",
        },
      },
    );
    response.headers.append("set-cookie", "a=1; Domain=omio.com; Secure");
    response.headers.append("set-cookie", "b=2; HttpOnly");
    return response;
  });
  const response = await proxyRequest(
    new Request(`${local}/app/api/book?x=1&x=2`, {
      method: "POST",
      body: '{"id":42}',
      headers: {
        cookie: "session=abc",
        origin: local,
        "x-forwarded-host": "evil.example",
        connection: "x-private",
        "x-private": "secret",
      },
    }),
  );
  assert.equal((await response.json()).redirect_url, `${local}/app/results`);
  assert.deepEqual(response.headers.getSetCookie(), [
    "a=1; Secure",
    "b=2; HttpOnly",
  ]);
  assert.equal(response.headers.get("content-length"), null);
  assert.equal(response.headers.get("etag"), null);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});
test("binary content and upstream errors are preserved; network failures become 502", async (t) => {
  const mock = t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(new Uint8Array([0, 255, 128]), {
        status: 403,
        headers: { "content-type": "application/octet-stream" },
      }),
  );
  const response = await proxyRequest(new Request(`${local}/asset`));
  assert.equal(response.status, 403);
  assert.deepEqual(
    new Uint8Array(await response.arrayBuffer()),
    new Uint8Array([0, 255, 128]),
  );
  mock.mock.mockImplementation(async () => {
    throw new Error("connection failed");
  });
  assert.equal((await proxyRequest(new Request(`${local}/app/a`))).status, 502);
});

test("localhost journey links restore the Omio production prefix", async () => {
  const response = await proxyRequest(
    new Request(`${local}/journey/train/1/search/2?partnerId=raileurope`),
  );
  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    `${local}/app/search-frontend/journey/train/1/search/2?partnerId=raileurope`,
  );
});


test("approved User-Agent marker stays scoped to the Rail Europe upstream", async (t) => {
  const originalMarker = process.env.OMIO_WAF_USER_AGENT_MARKER;
  const originalUpstream = process.env.OMIO_UPSTREAM_ORIGIN;
  process.env.OMIO_WAF_USER_AGENT_MARKER = "wafallow=test-marker";
  process.env.OMIO_UPSTREAM_ORIGIN = upstream;
  let outgoing = "";
  t.mock.method(globalThis, "fetch", async (_url: URL, init: RequestInit) => {
    outgoing = new Headers(init.headers).get("user-agent") || "";
    return new Response("ok");
  });
  try {
    const request = () => new Request(`${local}/app/results`, {
      headers: { "user-agent": "Browser/1.0" },
    });
    const response = await proxyRequest(request());
    assert.equal(outgoing, "Browser/1.0 wafallow=test-marker");
    assert.equal(await response.text(), "ok");
    assert.equal(response.headers.get("user-agent"), null);
    process.env.OMIO_UPSTREAM_ORIGIN = "https://other.example";
    await proxyRequest(request());
    assert.equal(outgoing, "Browser/1.0");
    process.env.OMIO_UPSTREAM_ORIGIN = upstream;
    delete process.env.OMIO_WAF_USER_AGENT_MARKER;
    await proxyRequest(request());
    assert.equal(outgoing, "Browser/1.0");
  } finally {
    if (originalMarker === undefined) delete process.env.OMIO_WAF_USER_AGENT_MARKER;
    else process.env.OMIO_WAF_USER_AGENT_MARKER = originalMarker;
    if (originalUpstream === undefined) delete process.env.OMIO_UPSTREAM_ORIGIN;
    else process.env.OMIO_UPSTREAM_ORIGIN = originalUpstream;
  }
});
