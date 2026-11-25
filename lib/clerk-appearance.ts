/** Shared Clerk appearance for pricing and account controls. */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--card)",
    colorText: "var(--text)",
    colorTextSecondary: "var(--muted)",
    colorNeutral: "var(--text)",
    colorInputBackground: "transparent",
    colorInputText: "var(--text)",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: { width: "100%" },
    cardBox: {
      background: "var(--glass)",
      border: "1px solid var(--border)",
      boxShadow: "var(--reference-shadow)",
      backdropFilter: "none",
      borderRadius: "12px",
      maxWidth: "100%",
    },
    card: { background: "transparent", boxShadow: "none" },
    footer: { background: "transparent" },
    formButtonPrimary: { background: "var(--primary)", boxShadow: "none", fontWeight: 650 },
    socialButtonsBlockButton: { background: "var(--glass)", border: "1px solid var(--border)" },
    pricingTableCard: { background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--reference-shadow)", borderRadius: "14px" },
    userButtonPopoverCard: { background: "var(--card)", boxShadow: "var(--reference-shadow)" },
  },
};
