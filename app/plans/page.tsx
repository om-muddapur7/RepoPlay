import type { Metadata } from "next";
import { Checkout } from "../../components/checkout";
import { PlanCards } from "../../components/plan-cards";

export const metadata: Metadata = { title: "Pricing", description: "Simple, flexible plans for exploring GitHub projects." };

const rows = [
  ["Website previews", "2 total", "Unlimited", "Unlimited"],
  ["Preview length", "10 minutes", "10 minutes", "10 minutes"],
  ["Private gallery", "—", "Included", "Included"],
  ["Reopen saved projects", "—", "Included", "Included"],
  ["Frontend-only demos", "Included", "Included", "Included"],
  ["Support", "Community", "Email", "Priority"],
];

const faqs = [
  ["Can I cancel any time?", "Yes. Manage or cancel your subscription from your account page. You keep access until the end of the paid period."],
  ["What counts as a preview?", "Each time you create a temporary preview from a GitHub repository counts once on the free trial. Paid plans have no preview cap."],
  ["Which payment methods do you accept?", "Cards and wallets supported by Stripe, handled through Clerk Billing. RepoPlay never sees your card details."],
  ["Do previews run my project's backend?", "No. RepoPlay previews static sites and compatible frontend builds. Backend servers and databases are not started."],
];

export default function Plans() {
  return (
    <main className="shell page">
      <header className="page-head center">
        <span className="eyebrow">Pricing</span>
        <h1>Plans &amp; <span className="accent">subscriptions</span></h1>
        <p>Start free. Upgrade when you want unlimited previews and a private gallery.</p>
      </header>
      <PlanCards />
      <Checkout />
      <section className="section">
        <div className="section-head"><h2>Compare plans</h2></div>
        <div className="glass table-wrap">
          <table className="compare">
            <thead><tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Basic</th><th scope="col">Premium</th></tr></thead>
            <tbody>{rows.map(([feature, ...cells]) => <tr key={feature}><td>{feature}</td>{cells.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <div className="section-head"><h2>Questions, answered</h2></div>
        <div className="faq">{faqs.map(([q, a]) => <details className="glass" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </section>
    </main>
  );
}
