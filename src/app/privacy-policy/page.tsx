import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy | Rail Europe" };

export default function Page() {
  return (
    <article className="content-page">
      <p className="eyebrow">DEMO CONTENT</p>
      <h1>Privacy Policy</h1>
      <p className="intro">Placeholder content for the integration demo.</p>
      <h2>About this placeholder</h2>
      <p>This page contains dummy content for the Rail Europe × Omio integration proof of concept. It is not an official privacy policy.</p>
      <h2>Information used by the demo</h2>
      <p>The demonstration sends journey search details to the Omio whitelabel through a reverse proxy. A production privacy notice would describe the actual data collected, purposes, recipients, and retention periods.</p>
      <h2>Cookies and your choices</h2>
      <p>The booking application may use cookies and related technologies. A production policy would explain those technologies, available choices, and how to contact the responsible privacy team.</p>
      <Link className="text-link" href="/">Back to search ↗</Link>
    </article>
  );
}
