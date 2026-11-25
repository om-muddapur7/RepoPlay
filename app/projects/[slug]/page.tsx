import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectArt } from "../../../components/project-art";
import { projects } from "../../../lib/catalog";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project ? { title: project.title, description: project.description } : {};
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <main className="shell details">
      <Link className="back-link" href="/workspace#samples">← Back to projects</Link>
      <div className="detail-grid">
        <div>
          <p className="category">{project.category}</p>
          <h1>{project.title}</h1>
          <p className="detail-copy">{project.description}</p>
          <p className="detail-copy">By {project.author} · {project.technology}</p>
          <div className="actions">
            <a className="button" href={project.demo} target="_blank" rel="noopener noreferrer">Open live demo</a>
            <a className="ghost-button" href={project.source} target="_blank" rel="noopener noreferrer">View on GitHub</a>
          </div>
        </div>
        <ProjectArt theme={project.theme} />
      </div>
    </main>
  );
}
