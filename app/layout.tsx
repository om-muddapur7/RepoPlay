import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RepoPlay", template: "%s · RepoPlay" },
  description: "Discover software projects through their live demos.",
};

function SectionLinks() {
  return (
    <>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/plans">Plans</a>
      <a href="/profile">Profile</a><a href="#contact">Contact me</a>
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <nav className="shell nav" aria-label="Main navigation">
            <a className="brand" href="/"><span aria-hidden="true">R</span> RepoPlay</a>
            <div className="section-links"><SectionLinks /></div>
            <div className="nav-actions">
              <button className="quiet-button theme-toggle" id="theme-toggle" type="button" aria-label="Switch to light mode" title="Switch to light mode">
                <span aria-hidden="true">☀︎</span>
              </button>
              <a className="quiet-button" id="account-signin" href="/signin">Sign in</a>
              <details id="account-avatar" className="account-menu" hidden>
                <summary aria-label="Account menu"><span></span></summary>
                <div><strong>Your account</strong><a href="/profile">Profile &amp; plan</a><a href="/signin?mode=signout">Sign out</a></div>
              </details>
            </div>
          </nav>
        </header>
        {children}
        <footer className="shell landing-footer" id="contact">
          <a className="footer-brand" href="/">RepoPlay</a><p><strong>Om Muddapur</strong></p>
          <div className="social-icons" aria-label="Social links">
            <a href="https://github.com/om-muddapur7" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54l-.02-2.08c-3.12.68-3.78-1.32-3.78-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .1 1.12 1.64 3.25.83.1-.73.39-1.23.71-1.51-2.49-.29-5.11-1.25-5.11-5.54 0-1.22.44-2.22 1.15-3-.11-.29-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.61 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.12 5.53.4.35.76 1.03.76 2.08l-.02 3.08c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/></svg>
            </a>
            <a href="https://om-portfolio-plum.vercel.app/" target="_blank" rel="noopener noreferrer" title="Portfolio" aria-label="Portfolio">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h8"/></svg>
            </a>
            <a href="https://x.com/Om7248" target="_blank" rel="noopener noreferrer" title="X" aria-label="X"><span aria-hidden="true">𝕏</span></a>
          </div>
          <nav className="section-links" aria-label="Footer navigation"><SectionLinks /></nav>
        </footer>
        <script src="/workspace.js" defer />
      </body>
    </html>
  );
}
