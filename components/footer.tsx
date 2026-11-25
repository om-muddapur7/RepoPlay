import Link from "next/link";
import { Github, Globe, XIcon } from "./icons";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">R</span>RepoPlay</Link>
            <p>Turn any public GitHub repository into a live, interactive demo in seconds.</p>
          </div>
          <div>
            <h4>Product</h4>
            <div className="footer-links"><Link href="/workspace">Workspace</Link><Link href="/plans">Pricing</Link><Link href="/about">How it works</Link></div>
          </div>
          <div>
            <h4>Company</h4>
            <div className="footer-links"><Link href="/contact">Contact</Link><Link href="/profile">Account</Link></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} RepoPlay · Built by Om Muddapur</span>
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
