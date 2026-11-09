import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browser Back POC | Rail Europe",
  description: "How the Rail Europe whitelabel search POC handles browser Back navigation.",
};

export default function BackNavigation() {
  return (
    <article className="diagram-page">
      <header className="diagram-heading">
        <h1>Browser Back after whitelabel search</h1>
        <p>
          This POC tests how to return from Omio search results to the Rail Europe
          landing page with one press of the browser Back button.
        </p>
      </header>

      <div className="integration-notes">
        <section aria-labelledby="try-title">
          <h2 id="try-title">Try the two search flows</h2>
          <ol>
            <li>
              On the <Link href="/">POC landing page</Link>, leave “Explore places to stay”
              off and click Search. The Links transfer page opens in the same tab,
              followed by search results. One browser Back returns to the landing page.
            </li>
            <li>
              Turn “Explore places to stay” on and click Search. Search opens in a
              new tab while the original tab goes to Booking.com. Browser Back in
              the new search tab cannot return to the original tab’s landing page.
            </li>
          </ol>
        </section>

        <section aria-labelledby="change-title">
          <h2 id="change-title">What changes in the same-tab flow</h2>
          <p>
            The normal <code>/links/{"{uuid}"}</code> transfer page still fetches
            <code> /links/{"{uuid}"}/link</code>, including its search, cookie and
            clickout behavior. This POC changes only its final navigation:
          </p>
          <pre><code>{`// Current transfer page
window.location.href = redirectUrl;

// POC: replace the transfer page in browser history
window.location.replace(redirectUrl);`}</code></pre>
          <p>
            Replacing that history entry means Back from results reaches the
            landing page instead of reopening the Links loader.
          </p>
        </section>

        <section aria-labelledby="options-title">
          <h2 id="options-title">Planned implementation</h2>
          <p>
            Omio plans to add a Rail Europe-only toggle in the Links service to
            use <code>location.replace</code>. The service change still needs its
            normal team review before rollout.
          </p>
          <p>
            Rail Europe could also make the same change in its existing reverse
            proxy by modifying the HTML response for <code>/links/{"{uuid}"}</code>,
            as this POC does. That approach depends on the current transfer-page
            HTML and is available as an alternative.
          </p>
        </section>

        <section aria-labelledby="limits-title">
          <h2 id="limits-title">Validation boundary</h2>
          <p>
            One Back from the same-tab results URL returned to the landing page
            in local Chrome and on this Vercel POC. The POC uses preset search
            values; it does not prove that Rail Europe’s real widget restores
            entered stations, dates, passengers or railcards. The proxied results
            also show a cookie-banner permission error on the POC domain. Rail
            Europe staging and production have not been changed or validated.
          </p>
        </section>
      </div>
    </article>
  );
}
