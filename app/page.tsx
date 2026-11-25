import { Show, SignInButton } from "@clerk/nextjs";
import { PricingTable } from "@clerk/nextjs";
import { BoltIcon, CodeIcon, FolderIcon, LayersIcon, PlayIcon, ReactIcon } from "../components/icons";

const features = [
  { Icon: PlayIcon, bg: "#2563EB", title: "Try the actual app", description: "Click through a live demo before you clone the repository." },
  { Icon: BoltIcon, bg: "#F59E0B", title: "Skip the local setup", description: "Open an existing Vercel demo or build a supported project directly from its public GitHub source." },
  { Icon: FolderIcon, bg: "#06B6D4", title: "Keep what worked", description: "Successfully rendered projects stay in your private gallery so you can revisit them." },
  { Icon: ReactIcon, bg: "#10B981", title: "React + Vite apps", description: "Build and preview compatible Vite and Create React App projects straight from GitHub." },
  { Icon: CodeIcon, bg: "#8B5CF6", title: "Plain HTML, CSS and JS", description: "Static sites with a root index.html open instantly, no build step needed." },
  { Icon: LayersIcon, bg: "#EF4444", title: "Frontend demos", description: "Preview the client of a full-stack project. Frontend demos run without backend services." },
];

export default function HomePage() {
  return (
    <main className="nest-home">
      <section className="hero" aria-labelledby="home-title">
        <h1 id="home-title">Welcome to<br /><span>RepoPlay</span></h1>
        <p>Turn a public GitHub repository into a quick, interactive demo.</p>
        <div className="hero-actions">
          <a className="button" href="/workspace">Open workspace</a>
          <Show when="signed-out"><SignInButton mode="modal"><button className="quiet-button" type="button">Sign in</button></SignInButton></Show>
        </div>
        <p className="hero-note"><img src="/hero-avatars.png" height={32} alt="" />Free trial includes 2 website previews</p>
      </section>

      <section className="shell section center" id="about" aria-labelledby="benefits-title">
        <h2 className="section-title" id="benefits-title">From source to screen</h2>
        <p className="section-copy">Preview React + Vite apps, plain HTML/CSS/JavaScript sites, and frontend-only demos of compatible full-stack projects. Frontend demos run without backend services.</p>
        <ul className="card-grid">
          {features.map(({ Icon, bg, title, description }) => (
            <li className="tool-card" key={title}>
              <div className="tool-icon" style={{ background: bg }}><Icon /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
        <a className="link-arrow" href="/about">How RepoPlay works →</a>
      </section>

      <section className="home-pricing" aria-labelledby="pricing-title">
        <h2 className="section-title" id="pricing-title">Choose your plan</h2>
        <p className="section-copy">Try two previews for free, or subscribe for unlimited previews.</p>
        <PricingTable for="user" newSubscriptionRedirectUrl="/workspace" />
        <a className="link-arrow" href="/plans">Compare plans →</a>
      </section>
    </main>
  );
}
