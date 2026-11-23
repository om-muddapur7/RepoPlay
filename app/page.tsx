const benefits = [
  { title: "Try the actual app", description: "Click through a live demo before you clone the repository." },
  { title: "Skip the local setup", description: "Run supported React + Vite projects in your browser, or open an existing Vercel demo." },
  { title: "Keep what worked", description: "Successfully rendered projects stay in your private gallery so you can revisit them." },
];

const plans = [
  { title: "Free trial", price: "$0", period: "", features: ["2 website previews", "10 minutes per preview"] },
  { title: "Weekly", price: "$5", period: "/ week", features: ["7 days of access", "Private project gallery", "Reopen saved projects"] },
  { title: "Monthly", price: "$18", period: "/ month", features: ["1 month of access", "Private project gallery", "Reopen saved projects"] },
];

export default function HomePage() {
  return (
    <main className="shell workspace landing">
      <section className="workspace-intro landing-hero" aria-labelledby="home-title">
        <h1 id="home-title">RepoPlay</h1>
        <p>Paste a public GitHub link and try the project as a quick demo in your browser.</p>
        <div className="landing-actions">
          <a className="button" href="/workspace">Open workspace</a>
          <a className="quiet-button" id="landing-signin" href="/signin">Sign in with Google</a>
        </div>
      </section>

      <section className="landing-section" id="about" aria-labelledby="benefits-title">
        <div className="landing-heading">
          <h2 id="benefits-title">What RepoPlay does</h2>
          <p>RepoPlay opens an existing demo or builds a supported frontend from its public GitHub source. You can interact with the app as soon as it renders.</p>
        </div>
        <ul className="landing-grid">
          {benefits.map(benefit => (
            <li className="landing-card" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-section" id="pricing" aria-labelledby="pricing-title">
        <div className="landing-heading">
          <h2 id="pricing-title">Pricing</h2>
          <p>Planned pricing. Checkout and plan limits aren’t active yet.</p>
        </div>
        <ul className="landing-grid">
          {plans.map((plan, index) => (
            <li className={`landing-card plan-card${index === 0 ? " current-plan" : ""}`} key={plan.title}>
              <div className="plan-heading">
                <h3>{plan.title}</h3>
                {index === 0 && <span className="plan-badge">Current plan</span>}
              </div>
              <p className="plan-price"><strong>{plan.price}</strong>{plan.period && <span>{plan.period}</span>}</p>
              <ul className="plan-features">
                {plan.features.map(feature => <li key={feature}>{feature}</li>)}
              </ul>
              {index === 0 ? <a className="quiet-button plan-action" href="/workspace">Try free</a> : (
                <details className="plan-action">
                  <summary className="button">Subscribe</summary>
                  <p role="status">Checkout is coming soon.</p>
                </details>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
