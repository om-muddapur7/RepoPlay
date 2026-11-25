import { auth, clerkClient } from "@clerk/nextjs/server";
import { galleryEntries } from "./gallery-history";

export const FREE_PREVIEW_LIMIT = 2;
const paidPlans = (process.env.PAID_PLAN_SLUGS ?? "basic,premium").split(",").map(slug => slug.trim()).filter(Boolean);

/** Signed-in user id and whether they hold a paid Clerk Billing plan. */
export async function session() {
  const { userId, has } = await auth();
  if (!userId) return null;
  const paid = paidPlans.some(plan => has({ plan }));
  return { userId, paid };
}

export async function readPrivate(userId: string) {
  const user = await (await clerkClient()).users.getUser(userId);
  const meta = user.privateMetadata as { repoplay_rendered?: unknown; repoplay_created?: number };
  return {
    user,
    projects: galleryEntries(meta.repoplay_rendered),
    created: Number.isSafeInteger(meta.repoplay_created) ? (meta.repoplay_created as number) : 0,
  };
}

export async function writePrivate(userId: string, data: { repoplay_rendered?: unknown; repoplay_created?: number }) {
  await (await clerkClient()).users.updateUserMetadata(userId, { privateMetadata: data });
}
