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
            <li><strong>Agree access with Omio.</strong> Agree proxy identification with Omio’s infrastructure team. This POC uses an approved server-side User-Agent marker. Then validate search, booking, login, and payment on the real domain before rollout.</li>
          </ol>
          <p>The architecture below uses <code>raileurope.com</code> as the target domain. In this demo, substitute the Vercel hostname wherever that domain appears.</p>
        </section>
      </div>
      <ArchitectureViewer />
      <a className="source-link" href="/integration-diagram.mmd" download>
        Download Mermaid source ↓
      </a>
      <div className="integration-notes">
        <section aria-labelledby="search-parameters-title">
          <h2 id="search-parameters-title">Search parameters: demo and production</h2>
          <p>
            For POC demo purposes, the search uses only four parameters:
            <code> departurePosTerm</code>, <code>arrivalPosTerm</code>,
            <code> departureDate</code>, and <code>passengerAges</code>.
            This keeps the demo minimal; the Links integration supports the
            additional parameters listed below.
          </p>
          <h3>Use position IDs in your station suggester</h3>
          <p>
            For the Rail Europe integration, prefer <code>departurePos</code> and
            <code> arrivalPos</code> over free-text station terms. Map your stations
            to the position IDs returned by Omio’s B2B API Positions endpoint and
            expose those mapped stations in your search suggester. When a traveller
            selects a suggestion, retain its position ID and send that ID in the
            search link.
          </p>
          <p>
            Use IDs for both departure and arrival, or terms for both; do not mix
            an ID on one side with a term on the other. When both an ID and a term
            are supplied for the same side, the ID takes precedence.
          </p>
          <h3>Supported link query parameters</h3>
          <div className="parameter-table-scroll" role="region" aria-label="Supported link query parameters" tabIndex={0}>
            <table className="parameter-table">
              <thead><tr><th scope="col">Parameter</th><th scope="col">Usage</th></tr></thead>
              <tbody>
                <tr><th scope="row"><code>departurePos</code>, <code>arrivalPos</code></th><td>Numeric departure and arrival position IDs.</td></tr>
                <tr><th scope="row"><code>departurePosTerm</code>, <code>arrivalPosTerm</code></th><td>Departure and arrival city or town names, as an alternative to IDs.</td></tr>
                <tr><th scope="row"><code>departureDate</code>, <code>returnDate</code></th><td>Outbound and optional return dates in YYYY-MM-DD format.</td></tr>
                <tr><th scope="row"><code>earliestDepartureTime</code>, <code>arrivalTime</code></th><td>Earliest outbound departure time or outbound arrival time in HH:mm format.</td></tr>
                <tr><th scope="row"><code>earliestReturnDepartureTime</code>, <code>returnArrivalTime</code></th><td>Earliest return departure time or return arrival time in HH:mm format, for round trips.</td></tr>
                <tr><th scope="row"><code>passengerAges</code></th><td>Comma-separated passenger ages, for example 35,12.</td></tr>
                <tr><th scope="row"><code>travelMode</code></th><td>Travel mode: TRAIN, BUS, or FLIGHT.</td></tr>
                <tr><th scope="row"><code>locale</code>, <code>currency</code></th><td>Supported language/locale and currency codes.</td></tr>
                <tr><th scope="row"><code>provider</code></th><td>Provider ID used to pick the best journey match when landing on the Ticket Configuration Page.</td></tr>
                <tr><th scope="row"><code>label</code></th><td>Partner-specific tracking label.</td></tr>
                <tr><th scope="row"><code>abTestParameters</code></th><td>Comma-separated experiment parameters; coordinate their use with Omio.</td></tr>
                <tr><th scope="row"><code>segmentIds</code>, <code>returnSegmentIds</code></th><td>Comma-separated outbound or return journey segment IDs for exact journey matching when the segments are already known.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section aria-labelledby="alignment-title">
          <h2 id="alignment-title">Agree the integration details with Omio</h2>
          <ul>
            <li><strong>Domains and routes.</strong> Share your test and production domains. Agree the full list of supporting API and asset paths, including any <code>/wl-*</code> and <code>/gcs-proxy/*</code> dependencies, and check for conflicts with existing Rail Europe routes.</li>
            <li><strong>Proxy access.</strong> Provide the outbound IP addresses for each environment if they are fixed. Otherwise, agree a server-side identification mechanism with Omio, such as the User-Agent marker used by this POC. Omio configures the corresponding access rule; the public website hostname alone is not sufficient proof of trusted proxy traffic.</li>
            <li><strong>Search and navigation.</strong> Confirm the link ID, station-to-position mapping, and the search parameters your form will send. Link My Bookings to <code>/app/your-bookings</code> on your own domain.</li>
            <li><strong>Sessions and external services.</strong> Agree cookie handling, authentication callback URLs, and payment return URLs. Keep legitimate external payment and authentication destinations intact.</li>
          </ul>
        </section>
        <section aria-labelledby="cloudflare-title">
          <h2 id="cloudflare-title">Cloudflare access: approved POC configuration</h2>
          <p>
            Omio has configured a temporary Cloudflare exception for requests to
            <code> raileurope.wl.omio.com</code> whose <code>User-Agent</code>
            contains an approved marker. Deploying the Cloudflare rule alone is
            not enough: your reverse proxy must append that marker to its outgoing
            requests, including booking pages, APIs, and assets.
          </p>
          <ol>
            <li><strong>Obtain the current marker from Omio.</strong> The format is <code>wafallow=&lt;approved-value&gt;</code>. The actual value is intentionally omitted from this public page.</li>
            <li><strong>Store it on the server.</strong> This POC uses the server-only <code>OMIO_WAF_USER_AGENT_MARKER</code> setting, stored as a sensitive production environment variable in Vercel. Rail Europe should use the equivalent secret configuration on its own hosting. Do not commit the value, put it in client-side JavaScript, or send it to the browser in a cookie or response header.</li>
            <li><strong>Append it to the outgoing User-Agent.</strong> Preserve the original User-Agent and append a space followed by the marker. Apply this only to requests to <code>https://raileurope.wl.omio.com</code>; do not forward it to unrelated hosts or external redirect destinations.</li>
            <li><strong>Redeploy and validate.</strong> After configuring the marker, deploy the proxy and run a fresh search through your public domain. Check that results and their supporting requests load without a Cloudflare challenge.</li>
            <li><strong>Agree rotation and production access.</strong> Omio manages the accepted marker values. Update your server configuration and redeploy when they rotate. The current exception is temporary for POC validation; agree the production access arrangement and removal of the temporary rule with Omio.</li>
          </ol>
          <p>
            After applying this configuration, the POC’s production search loaded
            Berlin–Dresden results on the Vercel domain without the Cloudflare
            challenge. Payment and authentication still require separate validation.
          </p>
        </section>
        <section aria-labelledby="launch-title">
          <h2 id="launch-title">Validate on your domain before launch</h2>
          <ul>
            <li>Confirm your homepage, landing pages, editorial content, and legal pages still load normally.</li>
            <li>Run a search through <code>/links/da69db62-5653-42f8-9b17-84830c319d08</code>, open results, and continue through fare selection. Refresh booking pages and check that assets and API requests load through the agreed routes.</li>
            <li>Validate login, My Bookings, and the payment journey with Omio, including return navigation and session continuity.</li>
            <li>Check mobile and desktop journeys, replace demo content with your approved content, and agree monitoring and a rollback plan for the routing change.</li>
          </ul>
          <p>This POC demonstrates the proposed routing approach. It does not replace end-to-end validation on Rail Europe’s hosting and production domain.</p>
        </section>
      </div>
    </article>
  );
}
