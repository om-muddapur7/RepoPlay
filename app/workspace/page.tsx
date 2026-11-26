import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SampleProjects } from "../../components/sample-projects";
import { Workspace } from "../../components/workspace";

export const metadata: Metadata = { title: "Workspace" };

export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ repo?: string | string[] }> }) {
  await auth.protect();
  const { repo } = await searchParams;
  return (
    <main className="workspace-layout">
      <aside className="workspace-sidebar">
        <nav aria-label="Workspace sections">
          <a href="#preview">Preview a repository</a>
          <a href="#gallery">Your projects</a>
          <a href="#samples">Sample projects</a>
          <a href="/profile">Your account</a>
        </nav>
      </aside>
      <div className="workspace-main">
      <Workspace initialRepository={typeof repo === "string" ? repo.slice(0, 256) : undefined} />
      <section id="samples" aria-labelledby="sample-title">
        <div className="gallery-head"><div><h2 id="sample-title">Sample projects</h2><p>Three interactive demos to try.</p></div></div>
        <SampleProjects />
      </section>
      </div>
    </main>
  );
}
