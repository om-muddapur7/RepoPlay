import type { Metadata } from "next";
import type { ReactNode } from "react";
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
            <a className="brand" href="/"><span aria-hidden="true">R</span> RepoPlay</a>
            <div className="nav-actions">
              <button className="quiet-button theme-toggle" id="theme-toggle" type="button" aria-label="Switch to light mode" title="Switch to light mode">
                <span aria-hidden="true">☀︎</span>
              </button>
              <a className="quiet-button" id="account-signin" href="/signin">Sign in</a>
              <details id="account-avatar" className="account-menu" hidden>
                <summary aria-label="Account menu"><span></span></summary>
                <div><strong>Your account</strong><a href="/signin?mode=signout">Sign out</a></div>
              </details>
            </div>
          </nav>
        </header>
        {children}
        <script src="/workspace.js" defer />
      </body>
    </html>
  );
}
