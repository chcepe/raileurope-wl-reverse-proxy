import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Rail Europe | Your next journey",
  description:
    "Explore Europe by train. Rail Europe and Omio integration demo.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Rail Europe home">
            <Image
              src="/rail-europe-logo.svg"
              alt="Rail Europe"
              width={170}
              height={57}
              priority
            />
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/">Train tickets</Link>
            <Link href="/blog">Discover</Link>
            <a href="/app/your-bookings" target="_blank" rel="noopener noreferrer">
              My Bookings
            </a>
            <Link href="/integration-overview">Integration Overview</Link>
          </nav>
          <span className="locale">🇩🇪　 English　⌄　 EUR　⌄</span>
        </header>
        <main>{children}</main>
        <footer>
          <Link className="footer-brand" href="/">
            Rail Europe
          </Link>
          <span>A little closer to your next adventure.</span>
          <Link href="/blog">Discover</Link>
          <Link href="/imprint">Imprint</Link>
          <Link href="/integration-overview">Integration Overview</Link>
          <small>Rail Europe × Omio · Integration demo</small>
        </footer>
      </body>
    </html>
  );
}
