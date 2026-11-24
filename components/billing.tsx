export function Billing({ profile = false }: { profile?: boolean }) {
  return (
    <section className="nest-billing" aria-labelledby="billing-heading">
      <h2 id="billing-heading">{profile ? "Manage subscription" : "Choose your plan"}</h2>
      <p role="status" id="billing-status">Checking subscription availability…</p>
      <div id={profile ? "clerk-billing-profile" : "clerk-pricing-table"} />
      <button type="button" className="button" id="billing-signin" hidden>Sign in to billing</button>
    </section>
  );
}
