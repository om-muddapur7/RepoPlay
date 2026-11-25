export const plans = [
  { slug: "free", title: "Free trial", price: "$0", period: "", blurb: "Kick the tires with no card required.", features: ["2 website previews", "10 minutes per preview", "Sample project library"], cta: "Start free", featured: false },
  { slug: "basic", title: "Basic", price: "$5", period: "/ month", blurb: "For regular project previews.", features: ["Unlimited previews", "Private project gallery", "Reopen saved projects", "Frontend-only demos"], cta: "Choose Basic", featured: false },
  { slug: "premium", title: "Premium", price: "$12", period: "/ month", blurb: "Best value for everyday exploring.", features: ["Unlimited previews", "Private project gallery", "Reopen saved projects", "Frontend-only demos", "Priority support"], cta: "Choose Premium", featured: true },
] as const;
