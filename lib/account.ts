import { auth, clerkClient } from "@clerk/nextjs/server";
import { galleryEntries } from "./gallery-history";

import type { PlanTier } from "./plans";
export { FREE_PREVIEW_LIMIT } from "./plans";
const paidPlans = (process.env.PAID_PLAN_SLUGS ?? "basic,premium").split(",").map(slug => slug.trim()).filter(Boolean);

/** Signed-in user id and whether they hold a paid Clerk Billing plan. */
export async function session() {
  const { userId, has } = await auth();
  if (!userId) return null;
  const tier: PlanTier = paidPlans.includes("premium") && has({ plan: "premium" }) ? "premium"
    : paidPlans.some(plan => plan !== "premium" && has({ plan })) ? "basic" : "free";
  return { userId, tier, paid: tier !== "free" };
}

export async function readPrivate(userId: string) {
  const user = await (await clerkClient()).users.getUser(userId);
  const meta = user.privateMetadata as { repoplay_rendered?: unknown; repoplay_created?: number; repoplay_basic_created?: number };
  return {
    user,
    projects: galleryEntries(meta.repoplay_rendered),
    basicCreated: Number.isSafeInteger(meta.repoplay_basic_created) ? Math.max(0, meta.repoplay_basic_created!) : 0,
    created: Number.isSafeInteger(meta.repoplay_created) ? (meta.repoplay_created as number) : 0,
  };
}

export async function writePrivate(userId: string, data: { repoplay_rendered?: unknown; repoplay_created?: number; repoplay_basic_created?: number }) {
  await (await clerkClient()).users.updateUserMetadata(userId, { privateMetadata: data });
}
