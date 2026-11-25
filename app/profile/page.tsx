import type { Metadata } from "next";
import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { FREE_PREVIEW_LIMIT, readPrivate, session } from "../../lib/account";

export const metadata: Metadata = { title: "Account" };

export default async function Profile() {
  await auth.protect();
  const current = await session();
  const used = current ? (await readPrivate(current.userId)).created : 0;
  return (
    <main className="shell reference-page reference-account">
      <header className="reference-heading">
        <h1>Manage your account</h1>
        <p>Manage your details, security and subscription in one place.</p>
      </header>
      <section className="glass panel" aria-label="Current plan">
        <h2>{current?.paid ? "Pro plan active" : "Free trial"}</h2>
        <p className="sub">{current?.paid ? "You have unlimited previews and a private gallery." : `${Math.min(used, FREE_PREVIEW_LIMIT)} of ${FREE_PREVIEW_LIMIT} free previews used.`}</p>
        <div className="card-actions">
          {!current?.paid && <Link className="button" href="/plans#checkout">Upgrade</Link>}
          <Link className="ghost-button" href="/workspace">Open workspace</Link>
        </div>
      </section>
      <div className="reference-user-profile"><UserProfile routing="hash" /></div>
    </main>
  );
}
