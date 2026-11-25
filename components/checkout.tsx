"use client";

import { PricingTable, Show, SignInButton } from "@clerk/nextjs";

/** Clerk Billing checkout. Plans, prices and payments are managed in the Clerk dashboard. */
export function Checkout() {
  return (
    <section className="billing-panel glass" id="checkout" aria-labelledby="checkout-title">
      <h2 id="checkout-title">Subscribe</h2>
      <p>Secure checkout powered by Clerk and Stripe. Cancel any time from your account.</p>
      <Show when="signed-out">
        <SignInButton mode="modal" forceRedirectUrl="/plans#checkout"><button className="button" type="button">Sign in to subscribe</button></SignInButton>
      </Show>
      <Show when="signed-in">
        <PricingTable for="user" newSubscriptionRedirectUrl="/workspace" />
      </Show>
    </section>
  );
}
