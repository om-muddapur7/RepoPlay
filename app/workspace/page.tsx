import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SampleProjects } from "../../components/sample-projects";
import { Workspace } from "../../components/workspace";

export const metadata: Metadata = { title: "Workspace" };

export default async function WorkspacePage() {
  await auth.protect();
  return (
    <main className="shell page">
      <Workspace />
      <section id="samples" aria-labelledby="sample-title">
        <div className="gallery-head"><div><h2 id="sample-title">Sample projects</h2><p>Three interactive demos to try.</p></div></div>
        <SampleProjects />
      </section>
    </main>
  );
}
