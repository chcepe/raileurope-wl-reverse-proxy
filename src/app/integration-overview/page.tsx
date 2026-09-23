import { ArchitectureViewer } from "@/components/ArchitectureViewer";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Integration Overview | Rail Europe",
};

export default function IntegrationOverview() {
  return (
    <article className="diagram-page">
      <header className="diagram-heading">
        <p className="eyebrow">RAIL EUROPE × OMIO</p>
        <h1>Integration Overview</h1>
        <p>
          For this proof of concept, imagine that{' '}
          <a href="https://raileurope-wl-reverse-proxy.vercel.app/">raileurope-wl-reverse-proxy.vercel.app</a>{' '}
          is raileurope.com. The demo shows how your existing website and Omio’s
          booking journey can share your domain.
        </p>
      </header>
      <div className="integration-notes">
        <section aria-labelledby="partner-title">
          <h2 id="partner-title">What Rail Europe would implement</h2>
          <p>
            The Vercel site stands in for Rail Europe’s website and routing layer.
            In production, Rail Europe would configure this routing on its own
            hosting. Vercel is only the hosting choice for this demo.
          </p>
          <ol>
            <li><strong>Keep your existing pages.</strong> Continue serving your homepage, landing pages, editorial content, and legal pages from your current website.</li>
            <li><strong>Send searches through your domain.</strong> Your search form should navigate to <code>/links/da69db62-5653-42f8-9b17-84830c319d08</code> with the journey and passenger query parameters.</li>
            <li><strong>Route booking traffic to Omio.</strong> Proxy <code>/links/*</code>, <code>/app/*</code>, and agreed supporting API and asset paths to <code>https://raileurope.wl.omio.com</code>, preserving the path, query, method, and body. For example, <code>raileurope.com/app/your-bookings</code> would serve the upstream <code>raileurope.wl.omio.com/app/your-bookings</code>.</li>
            <li><strong>Keep responses on your domain.</strong> Adapt upstream redirects, absolute URLs, and applicable cookie domains so visitors remain on <code>raileurope.com</code>. Preserve cookie security attributes and avoid shared caching of session responses.</li>
            <li><strong>Agree access with Omio.</strong> Confirm fixed outbound IPs or a server-only secret header with Omio’s infrastructure team. Then validate search, booking, login, and payment on the real domain before rollout.</li>
          </ol>
          <p>The architecture below uses <code>raileurope.com</code> as the target domain. In this demo, substitute the Vercel hostname wherever that domain appears.</p>
        </section>
      </div>
      <ArchitectureViewer />
      <a className="source-link" href="/integration-diagram.mmd" download>
        Download Mermaid source ↓
      </a>
      <div className="integration-notes">
        <section aria-labelledby="implemented-title">
          <h2 id="implemented-title">What this demo implements</h2>
          <ul>
            <li><strong>Rail Europe pages:</strong> a branded landing page, Discover, Imprint, and placeholder Terms and Privacy pages stay in this Next.js site. My Bookings opens the proxied Omio application.</li>
            <li><strong>Search handoff:</strong> the preset Berlin–Dresden journey sends one adult, age 35, through <code>/links/:id</code>. Tomorrow’s date is calculated when Search is selected.</li>
            <li><strong>Same-domain proxy:</strong> Omio serves <code>/links/*</code>, <code>/app/*</code>, and supporting assets/API paths through a fixed upstream. HTTP redirects and the search link’s JSON redirect are rewritten to this site’s origin.</li>
            <li><strong>Sessions and responses:</strong> applicable cookie domains become host-only while security flags remain intact. Text references to the upstream origin are rewritten; binary assets stream through. Shared caching is disabled.</li>
            <li><strong>Local navigation fix:</strong> Omio drops the application prefix for journey links on localhost. A local-only redirect restores <code>/app/search-frontend</code> so fare selection can open.</li>
            <li><strong>Deployment:</strong> Next.js route handlers provide the Node proxy on Vercel, without a separate backend or database. The deployment hostname is used automatically for rewritten links.</li>
          </ul>
        </section>
        <section aria-labelledby="verified-title">
          <h2 id="verified-title">What’s been verified</h2>
          <p>Recorded checks from 22–23 September 2026: live search results and onward train fare/class selection loaded on localhost. Local content pages, diagram zoom and drag-to-pan were checked. Proxy/search tests, type checking, linting, and a production build passed during implementation.</p>
          <p>The Vercel deployment served the landing page, Discover, and Imprint. This confirms the site deployment, not the complete booking flow.</p>
        </section>
        <section aria-labelledby="remaining-title">
          <h2 id="remaining-title">What still needs work</h2>
          <ul>
            <li><strong>Deployed search:</strong> the last Vercel check stopped at Omio’s Cloudflare security verification. Omio infrastructure needs to confirm how to authorize server-side proxy traffic; adding the public hostname alone has not been proven sufficient.</li>
            <li><strong>Booking completion:</strong> login, My Bookings, payments, and third-party widgets need end-to-end verification on the deployment domain. Earlier checks also reported upstream experiment, authentication, and widget errors.</li>
            <li><strong>Production readiness:</strong> replace placeholder content, validate mobile layouts, and review cookie/domain requirements and Vercel payload/runtime limits. This proxy does not support WebSocket upgrades.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
