import Link from "next/link";
import { Bolt, Layers, Lock } from "../components/icons";
import { PlanCards } from "../components/plan-cards";
import { SampleProjects } from "../components/sample-projects";

const features = [
  { icon: <Bolt />, title: "Try the real app", text: "Click through a live demo before you clone a single line of code." },
  { icon: <Layers />, title: "Skip local setup", text: "Open an existing Vercel demo or build a supported project straight from its public GitHub source." },
  { icon: <Lock />, title: "Private by default", text: "Rendered projects land in your own gallery, visible only to you, ready to relaunch." },
];

const steps = [
  ["Paste a repo URL", "Drop in any public GitHub repository link."],
  ["We build the preview", "RepoPlay finds a live demo or builds the frontend from a pinned commit."],
  ["Explore for ten minutes", "Interact with it, then save it to your gallery."],
];

export default function HomePage() {
  return (
    <main>
      <section className="shell hero" aria-labelledby="home-title">
        <span className="eyebrow"><i />Live previews from any public repo</span>
        <h1 id="home-title">Run any repo. <span className="gradient-text">Skip the setup.</span></h1>
        <p className="lead">Turn a GitHub repository into a quick, interactive demo in your browser. No cloning, no installs, no environment drama.</p>
        <div className="hero-actions">
          <Link className="button" href="/workspace">Open workspace</Link>
          <Link className="ghost-button" href="/plans">View pricing</Link>
        </div>
        <p className="hero-note">Free trial includes 2 previews. No credit card required.</p>

        <div className="browser glass" aria-hidden="true">
          <div className="browser-bar">
            <div className="dots"><i /><i /><i /></div>
            <div className="url-pill">repoplay.app/temporary/…</div>
          </div>
          <div className="browser-body">
            <div>
              <div className="code-block">
                <div><b>const</b> repo = <em>&quot;owner/awesome-app&quot;</em>;</div>
                <div><b>await</b> repoplay.<em>preview</em>(repo);</div>
                <div>// ready in seconds</div>
              </div>
              <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
                <div className="skeleton w-80" /><div className="skeleton w-60" /><div className="skeleton" />
              </div>
            </div>
            <div>
              <div className="status-line"><b>●</b> Build complete</div>
              <div className="skeleton tall" />
              <div className="skeleton w-80" /><div className="skeleton w-60" />
            </div>
          </div>
        </div>
      </section>

      <section className="shell section" id="features" aria-labelledby="features-title">
        <div className="section-head">
          <h2 id="features-title">From source to screen</h2>
          <p>Preview React + Vite apps, plain HTML/CSS/JS sites, and frontend-only demos of compatible full-stack projects.</p>
        </div>
        <ul className="grid-3">
          {features.map(item => (
            <li className="feature glass" key={item.title}>
              <div className="feature-icon">{item.icon}</div>
              <h3>{item.title}</h3><p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell section" aria-labelledby="how-title">
        <div className="section-head"><h2 id="how-title">How it works</h2></div>
        <ol className="grid-3 steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {steps.map(([title, text]) => <li className="feature glass" key={title}><h3>{title}</h3><p>{text}</p></li>)}
        </ol>
      </section>

      <section className="shell section" aria-labelledby="samples-title">
        <div className="section-head"><h2 id="samples-title">Try a sample project</h2><p>Three interactive demos to get a feel for it.</p></div>
        <SampleProjects />
      </section>

      <section className="shell section" aria-labelledby="pricing-title">
        <div className="section-head"><h2 id="pricing-title">Pricing that stays out of the way</h2><p>Start free, upgrade when you need more.</p></div>
        <PlanCards checkoutHref="/plans#checkout" />
      </section>

      <section className="shell section">
        <div className="cta glass">
          <h2>Ready to see a repo come alive?</h2>
          <p>Create a free account and launch your first preview in under a minute.</p>
          <Link className="button" href="/sign-up">Get started free</Link>
        </div>
      </section>
    </main>
  );
}
