import { PricingTable } from "@clerk/nextjs";

export function PlansSection({ embedded = false }: { embedded?: boolean }) {
  const Container = embedded ? "section" : "main";
  const Heading = embedded ? "h2" : "h1";
  return (
    <Container id="plans" aria-labelledby="plans-title" className="shell reference-page reference-pricing">
      <header className="reference-heading">
        <Heading id="plans-title">Choose Your Plan</Heading>
        <p>Start with two free previews, or upgrade for unlimited previews and a private project gallery.</p>
      </header>
      <section id="checkout" aria-label="RepoPlay plans">
        <PricingTable for="user" newSubscriptionRedirectUrl="/workspace" />
      </section>
    </Container>
  );
}
