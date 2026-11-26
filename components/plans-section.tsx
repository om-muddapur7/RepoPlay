import { plans } from "../lib/plans";
import { PlanPricing } from "./plan-pricing";

export function PlansSection({ embedded = false }: { embedded?: boolean }) {
  const Container = embedded ? "section" : "main";
  const Heading = embedded ? "h2" : "h1";
  return (
    <Container id="plans" aria-labelledby="plans-title" className="shell reference-page reference-pricing">
      <header className="reference-heading">
        <Heading id="plans-title">Choose Your Plan</Heading>
        <p>Start with two free previews. Basic includes 20 previews and a private gallery. Premium adds unlimited previews with no time limit.</p>
      </header>
      <ul className="plan-feature-overview">
        {plans.map(plan => (
          <li className="panel glass" key={plan.slug}>
            <h3>{plan.title}</h3>
            <ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
          </li>
        ))}
      </ul>
      <section id="checkout" aria-label="RepoPlay plans">
        <PlanPricing defer={embedded} />
      </section>
    </Container>
  );
}
