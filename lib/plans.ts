export const FREE_PREVIEW_LIMIT = 2;
export const BASIC_PREVIEW_LIMIT = 20;
export const previewLimits = { free: FREE_PREVIEW_LIMIT, basic: BASIC_PREVIEW_LIMIT, premium: null } as const;

export const planNames = { free: "Free trial", basic: "Basic", premium: "Premium" } as const;
export type PlanTier = keyof typeof planNames;

export const plans = [
  { slug: "free", title: "Free trial", price: "$0", period: "", blurb: "Kick the tires with no card required.", features: [`${FREE_PREVIEW_LIMIT} website previews`, "10 minutes per preview", "Sample project library", "Standard compatibility checks"], cta: "Start free", featured: false },
  { slug: "basic", title: "Basic", price: "$5", period: "/ month", blurb: "For regular project previews.", features: [`${BASIC_PREVIEW_LIMIT} previews`, "10 minutes per preview", "Sample project library", "Private project gallery", "Reopen saved projects", "Frontend-only demos"], cta: "Choose Basic", featured: false },
  { slug: "premium", title: "Premium", price: "$12", period: "/ month", blurb: "Best value for everyday exploring.", features: ["Unlimited previews", "No time limit per preview", "Sample project library", "Compatibility checks in both modes", "Private project gallery", "Reopen saved projects", "Frontend-only demos"], cta: "Choose Premium", featured: true },
] as const;
