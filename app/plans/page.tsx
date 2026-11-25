import type { Metadata } from "next";
import { PricingTable } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Pricing", description: "Plans for previewing GitHub projects with RepoPlay." };

export default function Plans() {
  return (
    <main className="shell reference-page reference-pricing">
      <header className="reference-heading">
        <h1>Choose Your Plan</h1>
        <p>Start with two free previews, or upgrade for unlimited previews and a private project gallery.</p>
      </header>
      <section id="checkout" aria-label="RepoPlay plans">
        <PricingTable for="user" newSubscriptionRedirectUrl="/workspace" />
      </section>
    </main>
  );
}
