import Link from "next/link";
import { Github, Globe, XIcon } from "./icons";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">R</span>RepoPlay</Link>
            <p>Preview static sites and compatible React frontends from public GitHub repositories.</p>
          </div>
          <div>
            <h4>Company</h4>
            <div className="footer-links"><Link href="/">Home</Link><Link href="/about">About us</Link><Link href="/contact">Contact us</Link><Link href="/plans">Pricing</Link></div>
          </div>
          <div>
            <h4>Explore RepoPlay</h4>
            <p>Create a preview or reopen a project from your workspace.</p>
            <Link className="button" href="/workspace">Open workspace</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} RepoPlay · Om Muddapur</span>
          <div className="social" aria-label="Social links">
            <a href="https://github.com/om-muddapur7" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github /></a>
            <a href="https://om-portfolio-plum.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Portfolio"><Globe /></a>
            <a href="https://x.com/Om7248" target="_blank" rel="noopener noreferrer" aria-label="X"><XIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
