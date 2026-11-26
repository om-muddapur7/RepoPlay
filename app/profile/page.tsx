import type { Metadata } from "next";
import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { planNames, previewLimits } from "../../lib/plans";
import { auth } from "@clerk/nextjs/server";
import { readPrivate, session } from "../../lib/account";

export const metadata: Metadata = { title: "Account" };

export default async function Profile() {
  await auth.protect();
  const current = await session();
  const tier = current?.tier ?? "free";
  const limit = previewLimits[tier];
  const usage = current && limit !== null ? await readPrivate(current.userId) : null;
  const used = (tier === "basic" ? usage?.basicCreated : usage?.created) ?? 0;
  return (
    <main className="shell reference-page reference-account">
      <header className="reference-heading">
        <h1>Manage your account</h1>
        <p>Manage your details, security and subscription in one place.</p>
      </header>
      <section className="glass panel" aria-label="Current plan">
        <h2>{planNames[current?.tier ?? "free"]}</h2>
        <p className="sub">{limit === null ? "Unlimited previews with no time limit." : `${Math.min(used, limit)} of ${limit} previews used.`}</p>
        <div className="card-actions">
          {tier !== "premium" && <Link className="button" href="/plans#checkout">Upgrade</Link>}
          <Link className="ghost-button" href="/workspace">Open workspace</Link>
        </div>
      </section>
      <div className="reference-user-profile"><UserProfile routing="hash" /></div>
    </main>
  );
}
