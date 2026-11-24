import { Billing } from "../../components/billing";

const plans = [
  { title: "Free trial", price: "$0", period: "", features: ["2 website previews", "10 minutes per preview"] },
  { title: "Weekly", price: "$5", period: "/ week", features: ["7 days of access", "Private project gallery", "Reopen saved projects"] },
  { title: "Monthly", price: "$18", period: "/ month", features: ["1 month of access", "Private project gallery", "Reopen saved projects"] },
];

export default function Plans(){return <main className="shell studio"><header><h1>Plans &amp; subscriptions</h1><p>Choose how long you want to explore.</p></header>      <section className="landing-section" id="plan-fallback" aria-labelledby="pricing-title">
        <div className="landing-heading">
          <h2 id="pricing-title">Compare plans</h2>
          <p>Planned pricing while subscriptions are being set up.</p>
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
                  <summary className="button">Subscription details</summary>
                  <p role="status">Checkout is coming soon.</p>
                </details>
              )}
            </li>
          ))}
        </ul>
      </section>
<Billing /></main>}
