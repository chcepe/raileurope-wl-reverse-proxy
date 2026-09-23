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
          <dl>
            <dt><code>departurePos</code>, <code>arrivalPos</code></dt>
            <dd>Numeric departure and arrival position IDs.</dd>
            <dt><code>departurePosTerm</code>, <code>arrivalPosTerm</code></dt>
            <dd>Departure and arrival city or town names, as an alternative to IDs.</dd>
            <dt><code>departureDate</code>, <code>returnDate</code></dt>
            <dd>Outbound and optional return dates in YYYY-MM-DD format.</dd>
            <dt><code>earliestDepartureTime</code>, <code>arrivalTime</code></dt>
            <dd>Earliest outbound departure time or outbound arrival time in HH:mm format.</dd>
            <dt><code>earliestReturnDepartureTime</code>, <code>returnArrivalTime</code></dt>
            <dd>Earliest return departure time or return arrival time in HH:mm format, for round trips.</dd>
            <dt><code>passengerAges</code></dt>
            <dd>Comma-separated passenger ages, for example 35,12.</dd>
            <dt><code>travelMode</code></dt>
            <dd>Travel mode: TRAIN, BUS, or FLIGHT.</dd>
            <dt><code>locale</code>, <code>currency</code></dt>
            <dd>Supported language/locale and currency codes.</dd>
            <dt><code>provider</code></dt>
            <dd>Provider ID used to pick the best journey match when landing on the Ticket Configuration Page.</dd>
            <dt><code>label</code></dt>
            <dd>Partner-specific tracking label.</dd>
            <dt><code>abTestParameters</code></dt>
            <dd>Comma-separated experiment parameters; coordinate their use with Omio.</dd>
            <dt><code>segmentIds</code>, <code>returnSegmentIds</code></dt>
            <dd>Comma-separated outbound or return journey segment IDs for exact journey matching when the segments are already known.</dd>
          </dl>
        </section>
        <section aria-labelledby="alignment-title">
          <h2 id="alignment-title">Agree the integration details with Omio</h2>
          <ul>
            <li><strong>Domains and routes.</strong> Share your test and production domains. Agree the full list of supporting API and asset paths, including any <code>/wl-*</code> and <code>/gcs-proxy/*</code> dependencies, and check for conflicts with existing Rail Europe routes.</li>
            <li><strong>Proxy access.</strong> Provide the outbound IP addresses for each environment if they are fixed. Otherwise, agree a secret header with Omio and inject it only on the server. Omio configures the corresponding access rule; the public website hostname alone is not sufficient proof of trusted proxy traffic.</li>
            <li><strong>Search and navigation.</strong> Confirm the link ID, station-to-position mapping, and the search parameters your form will send. Link My Bookings to <code>/app/your-bookings</code> on your own domain.</li>
            <li><strong>Sessions and external services.</strong> Agree cookie handling, authentication callback URLs, and payment return URLs. Keep legitimate external payment and authentication destinations intact.</li>
          </ul>
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
