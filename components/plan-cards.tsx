import Link from "next/link";
import { Check } from "./icons";
import { plans } from "../lib/plans";

export function PlanCards({ checkoutHref = "/plans#checkout" }: { checkoutHref?: string }) {
  return (
    <ul className="plans">
      {plans.map(plan => (
        <li key={plan.slug} className={`plan glass${plan.featured ? " featured" : ""}`}>
          {plan.featured && <span className="badge">Most popular</span>}
          <h3>{plan.title}</h3>
          <p className="price"><strong>{plan.price}</strong>{plan.period && <span>{plan.period}</span>}</p>
          <p className="blurb">{plan.blurb}</p>
          <ul>{plan.features.map(feature => <li key={feature}><Check />{feature}</li>)}</ul>
          <Link className={plan.featured ? "button" : "ghost-button"} href={plan.slug === "free" ? "/workspace" : checkoutHref}>{plan.cta}</Link>
        </li>
      ))}
    </ul>
  );
}
