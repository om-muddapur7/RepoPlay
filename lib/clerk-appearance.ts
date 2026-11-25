/** Shared Clerk theme so hosted components match the glass design. */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#6d7cff",
    colorBackground: "transparent",
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
      boxShadow: "var(--shadow)",
      backdropFilter: "blur(22px) saturate(160%)",
      borderRadius: "20px",
      maxWidth: "100%",
    },
    card: { background: "transparent", boxShadow: "none" },
    footer: { background: "transparent" },
    formButtonPrimary: { background: "var(--gradient)", boxShadow: "none", fontWeight: 650 },
    socialButtonsBlockButton: { background: "var(--glass)", border: "1px solid var(--border)" },
    pricingTableCard: { background: "var(--glass)", border: "1px solid var(--border)", boxShadow: "none" },
  },
};
