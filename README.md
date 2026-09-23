# Rail Europe × Omio POC

A Next.js / React / TypeScript landing site with a Node reverse proxy. The read-only landing page mirrors Rail Europe’s visual layout; `/integration-overview` presents the Integration Overview: architecture, implemented proxy behavior, recorded validation, and remaining integration gaps. Own pages stay on your domain; Omio supplies the search and booking application.

## Run locally

Use Node 22 (see `.nvmrc`). No credentials or environment file are required for the default demo.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production run, use `npm run build` followed by `npm start`.

The form defaults to Berlin → Dresden, tomorrow in the browser’s local timezone, one adult. The journey and passenger counts are read-only, as this is a minimal demonstration. Search remains active and uses one adult aged 35. Dates are recalculated at submission, including tabs left open overnight.

## Deploy to Vercel

1. Push this repository to your Git provider and import it in Vercel.
2. Select the **Next.js** preset and **Node.js 22.x**. Keep the default build/output settings and repository root directory.
3. Deploy. No separate backend, database, custom server, or Vercel routing file is needed.
4. Open the deployed URL and repeat the smoke checks below. The deployment hostname is used automatically for rewritten URLs.

Optional settings (copy `.env.example` to `.env.local` locally, or set in Vercel):

| Variable                   | Default                                | Purpose                                                                                                               |
| -------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `OMIO_UPSTREAM_ORIGIN`     | `https://raileurope.wl.omio.com`       | Server-only HTTPS origin, no path or credentials. Only trusted operator configuration; never accepted from a request. |
| `NEXT_PUBLIC_OMIO_LINK_ID` | `da69db62-5653-42f8-9b17-84830c319d08` | Search link ID. Rebuild after changing this public setting.                                                           |

## Routing and proxy behavior

- `/`, `/blog`, `/imprint`, `/integration-overview` (with `/diagram` redirecting to it), local public assets, and Next.js assets belong to this project.
- All remaining paths go to the fixed upstream, including `/links/*`, `/app/*`, `/wl-*`, `/gcs-proxy/*`, and API paths. This fallback is deliberate: Omio’s dependencies extend beyond `/app/*`.
- Search uses a full-page navigation to `/links/:id`. Omio’s loading page fetches `/links/:id/link`; the proxy rewrites its absolute JSON redirect to our origin.
- Methods, query strings, bodies, statuses, and session cookies are forwarded. HTTP redirects and exact upstream-origin references in text are rewritten; third-party origins are preserved.
- Applicable upstream cookie domains become host-only. Separate cookies and security flags are preserved. Cookies for unrelated domains are dropped, matching browser rejection.
- Binary responses stream through. Text is decoded and rewritten; original compression, length, and validator headers are removed. Proxy responses are private and not cached by shared CDNs.
- Omio intentionally drops the app prefix when opening journey pages on localhost. A local-only redirect restores `/app/search-frontend` for `/journey/{train,bus,flight,ferry}/*`. Deployed routing is unaffected.

## Cloudflare and deployment limits

Local success does not prove Vercel access. Cloudflare sees the server-side request to the Omio upstream, not simply a browser request to your Vercel domain. Ask the Omio infrastructure owner to verify the actual deployed request, source network, and intended allowlist mechanism if challenged or blocked. Adding the Vercel hostname alone has not been verified as sufficient. No bot challenges or security checks are bypassed here.

The proxy runs inside Vercel Functions: request/response payload and execution limits apply. Text responses are buffered for rewriting; binary responses stream. The upstream timeout is 45 seconds and route duration is 60 seconds. This POC does not support WebSocket upgrades. See [Vercel function limits](https://vercel.com/docs/functions/limitations).

Secure cookies remain Secure on localhost. For other local HTTP hostnames, use HTTPS if browser cookie rules require it. Third-party authentication, payments, analytics, and widgets can have their own domain restrictions. This is a POC, not certification of the full payment flow.

## Validation

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Smoke checks:

1. Open and refresh `/`, `/blog`, and `/imprint`; use shared navigation.
2. Search Berlin–Dresden. Confirm tomorrow, selected passengers, and results URL stay on the same origin.
3. Check results, filters, and a train’s fare/class selection. Do not purchase a ticket.
4. Check keyboard navigation, Search, the read-only journey details, `/integration-overview`, and narrow-screen layout.
5. Repeat on the actual Vercel deployment, including refresh of a proxied application URL.

Verified locally on 22 September 2026: live search results and onward train fare/class selection under localhost, local content pages, and keyboard passenger validation. Automated proxy/search tests, type checking, linting, and production build are part of the verification workflow. Production is deployed at https://raileurope-wl-reverse-proxy.vercel.app. Landing, blog, and imprint passed live checks. Search from Vercel is blocked by upstream Cloudflare security verification (Ray ID `a3f24e8bcc383982`); Omio infrastructure must authorize the intended proxy traffic. Payment and login remain unverified. Responsive CSS is included; mobile visual validation remains unverified because the browser viewport override did not apply reliably. Upstream emitted non-blocking experiment/auth/third-party widget errors during the smoke test; those integrations are not claimed working.

Branch notes live in ignored `tmp/<branch-name>/`. No real legal/contact details are included in the demo imprint.

## Visual assets and diagram

Rail Europe logo is taken from the configured whitelabel. Paris hero photo: [Unsplash](https://images.unsplash.com/photo-1502602898657-3e91760cbb34), served locally. Reference layout follows the supplied Rail Europe screenshot; no live review score or nonfunctional booking controls are reproduced.

Diagram source: `public/integration-diagram.mmd`; rendered SVG: `public/integration-diagram.svg`. Rendering is static, with no Mermaid runtime or editor shipped to the browser. Regenerate the SVG with Mermaid CLI after changing the source, using `docs/mermaid.config.json` and the dark background `#0b1117`.

### Approved Cloudflare proxy access

Set `OMIO_WAF_USER_AGENT_MARKER` to the current `wafallow=…` value supplied by Omio in server-only environment settings. The proxy appends it to the outgoing User-Agent only for `https://raileurope.wl.omio.com`. Never use a `NEXT_PUBLIC_` variable or commit the value. Update the setting and redeploy when Omio rotates the marker.
