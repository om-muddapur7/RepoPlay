import { TemporaryPreviewForm } from "../components/temporary-preview-form";
import { ProjectArt } from "../components/project-art";
import { projects } from "../lib/catalog";

const benefits = [
  { title: "Try the actual app", description: "Click through a live preview before deciding whether to clone the repository." },
  { title: "Skip the local setup", description: "Supported React + Vite projects build in your browser. Existing Vercel demos open in the viewer." },
  { title: "Keep what worked", description: "Find successfully rendered previews in your private gallery and open them again." },
];

const plans = [
  { title: "Free trial", price: "$0", period: "", description: "Preview 2 websites for 10 minutes each." },
  { title: "Weekly", price: "$5", period: "/ week", description: "One week of access." },
  { title: "Monthly", price: "$18", period: "/ month", description: "One month of access." },
];

export default function HomePage() {
  return (
    <main className="shell workspace">
      <section className="workspace-intro landing-hero" aria-labelledby="home-title">
        <h1 id="home-title">RepoPlay</h1>
        <p>Turn a public GitHub repository into an interactive, ten-minute preview. Try the app right in your browser, then come back to the projects you liked.</p>
        <div className="landing-actions">
          <a className="button" id="landing-signin" href="/signin">Sign in with Google</a>
          <a className="quiet-button" id="landing-workspace" href="#preview">Try a repository</a>
        </div>
      </section>
      <section className="landing-section" aria-labelledby="benefits-title">
        <h2 id="benefits-title">Why RepoPlay?</h2>
        <ul className="landing-grid">
          {benefits.map(benefit => (
            <li className="landing-card" key={benefit.title}>
              <h3>{benefit.title}</h3><p>{benefit.description}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="landing-section" id="pricing" aria-labelledby="pricing-title">
        <h2 id="pricing-title">Pricing</h2>
        <p className="pricing-note">Planned pricing. Checkout and plan limits aren’t active yet.</p>
        <ul className="landing-grid">
          {plans.map(plan => (
            <li className="landing-card plan-card" key={plan.title}>
              <h3>{plan.title}</h3>
              <p className="plan-price"><strong>{plan.price}</strong>{plan.period && <span>{plan.period}</span>}</p>
              <p>{plan.description}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="landing-section" id="preview" aria-labelledby="preview-title">
        <h2 id="preview-title">Preview a repository</h2>
        <TemporaryPreviewForm />
      </section>
      <section id="gallery" className="private-gallery" aria-labelledby="gallery-title">
        <div className="gallery-titlebar">
          <div><h2 id="gallery-title">Your projects</h2><p id="gallery-caption">Successfully rendered previews, visible only to you.</p></div>
          <label className="gallery-search" hidden><span className="sr-only">Search your projects</span><input type="search" placeholder="Search projects" /></label>
        </div>
        <p className="gallery-empty" id="gallery-empty" role="status">Checking your account…</p>
        <p id="gallery-notice" role="status"></p>
        <ul className="history-list" id="history-list" aria-label="Your rendered projects"></ul>
      </section>
      <section className="private-gallery" aria-labelledby="sample-title">
        <div className="gallery-titlebar">
          <div><h2 id="sample-title">Sample projects</h2><p>Three interactive demos to try.</p></div>
        </div>
        <ul className="history-list sample-list">
          {projects.map(project => (
            <li key={project.slug}>
              <ProjectArt theme={project.theme} />
              <div className="gallery-card-body">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="gallery-card-actions">
                  <a className="quiet-button" href={project.demo} target="_blank" rel="noopener noreferrer">Open demo</a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <footer className="landing-footer">
        <p>Built by <strong>Om Muddapur</strong></p>
        <nav aria-label="Om Muddapur links">
          <a href="https://github.com/om-muddapur7" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://om-portfolio-plum.vercel.app/" target="_blank" rel="noopener noreferrer">Portfolio</a>
          <a href="https://x.com/Om7248" target="_blank" rel="noopener noreferrer">X</a>
        </nav>
      </footer>
    </main>
  );
}
