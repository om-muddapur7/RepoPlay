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
            <div className="flex flex-wrap justify-end gap-4">
              <Link className="nav-link" href="/#gallery">Explore projects</Link>
              <a className="nav-link" href="/signin">Sign in</a>
              <a className="nav-link" href="/signin?mode=signout">Sign out</a>
            </div>
          </nav>
        </header>
        {children}
        <footer className="shell footer">RepoPlay <span>Discover software you can try.</span></footer>
      </body>
    </html>
  );
}
