const benefits = [
  { title: "Try the actual app", description: "Click through a live demo before you clone the repository." },
  { title: "Skip the local setup", description: "Open an existing Vercel demo or build a supported project directly from its public GitHub source." },
  { title: "Keep what worked", description: "Successfully rendered projects stay in your private gallery so you can revisit them." },
];

export default function HomePage() {
  return (
    <main className="shell workspace landing">
      <section className="workspace-intro landing-hero" aria-labelledby="home-title">
        <h1 id="home-title">RepoPlay</h1>
        <p>Turn a public GitHub repository into a quick, interactive demo.</p>
        <div className="landing-actions">
          <a className="button" href="/workspace">Open workspace</a>
          <a className="quiet-button" id="landing-signin" href="/signin">Sign in with Google</a>
        </div>
      </section>

      <section className="landing-section" id="about" aria-labelledby="benefits-title">
        <div className="landing-heading">
          <h2 id="benefits-title">From source to screen</h2>
          <p>Preview React + Vite apps, plain HTML/CSS/JavaScript sites, and frontend-only demos of compatible full-stack projects. Frontend demos run without backend services.</p>
        </div>
        <ul className="landing-grid">
          {benefits.map(benefit => (
            <li className="landing-card" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </li>
          ))}
        </ul><a className="story-link" href="/about">How RepoPlay works →</a>
      </section>

      <section className="plan-strip"><h2>Start with the free trial.</h2><a className="quiet-button" href="/plans">Explore plans →</a></section>
    </main>
  );
}
