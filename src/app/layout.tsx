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
            <span className="brand-mark" aria-hidden="true">
              R
            </span>
            <span>
              Rail
              <br />
              Europe
            </span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/">Book a train</Link>
            <Link href="/blog">Travel journal</Link>
          </nav>
          <span className="locale">English · EUR</span>
        </header>
        <main>{children}</main>
        <footer>
          <Link className="footer-brand" href="/">
            Rail Europe
          </Link>
          <span>A little closer to your next adventure.</span>
          <Link href="/blog">Travel journal</Link>
          <Link href="/imprint">Imprint</Link>
          <small>Rail Europe × Omio · Integration demo</small>
        </footer>
      </body>
    </html>
  );
}
