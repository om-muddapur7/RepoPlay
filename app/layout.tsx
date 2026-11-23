import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RepoPlay", template: "%s · RepoPlay" },
  description: "Discover software projects through their live demos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <nav className="shell nav" aria-label="Main navigation">
            <Link className="brand" href="/"><span aria-hidden="true">R</span> RepoPlay</Link>
            <Link className="nav-link" href="/#gallery">Explore projects</Link>
          </nav>
        </header>
        {children}
        <footer className="shell footer">RepoPlay <span>Discover software you can try.</span></footer>
      </body>
    </html>
  );
}
