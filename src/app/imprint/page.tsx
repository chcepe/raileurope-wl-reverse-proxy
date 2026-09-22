import Link from "next/link";
export default function Imprint() {
  return (
    <article className="content-page">
      <p className="eyebrow">ABOUT THIS WEBSITE</p>
      <h1>Imprint</h1>
      <p className="intro">Rail Europe × Omio integration proof of concept.</p>
      <h2>Demonstration website</h2>
      <p>
        This landing page, travel journal, and imprint contain placeholder
        content for an integration demo. This is not a complete legal imprint or
        an official Rail Europe website.
      </p>
      <h2>Travel search</h2>
      <p>
        Search and booking pages are supplied by Omio’s Rail Europe whitelabel.
        Searches use tomorrow’s date and representative passenger ages: adult
        35, senior 65, and youth 12.
      </p>
      <Link className="text-link" href="/">
        Back to search ↗
      </Link>
    </article>
  );
}
