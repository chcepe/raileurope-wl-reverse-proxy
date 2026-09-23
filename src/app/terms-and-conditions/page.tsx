import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms and Conditions | Rail Europe" };

export default function Page() {
  return (
    <article className="content-page">
      <p className="eyebrow">DEMO CONTENT</p>
      <h1>Terms and Conditions</h1>
      <p className="intro">Placeholder content for the integration demo.</p>
      <h2>About this demo</h2>
      <p>This page contains dummy content for the Rail Europe × Omio integration proof of concept. It is not the official terms of Rail Europe or Omio.</p>
      <h2>Using the website</h2>
      <p>The demo illustrates a landing page and a proxied travel booking journey. Information shown here is for demonstration purposes only.</p>
      <h2>Travel bookings</h2>
      <p>Applicable booking conditions, fares, and provider rules must be reviewed in the booking journey. This placeholder page does not define or replace those conditions.</p>
      <Link className="text-link" href="/">Back to search ↗</Link>
    </article>
  );
}
