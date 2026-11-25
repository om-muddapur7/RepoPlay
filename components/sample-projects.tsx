import { ProjectArt } from "./project-art";
import { projects } from "../lib/catalog";

export function SampleProjects() {
  return (
    <ul className="project-grid">
      {projects.map(project => (
        <li key={project.slug} className="project-card glass">
          <ProjectArt theme={project.theme} />
          <div className="card-body">
            <span className="tag">{project.technology}</span>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p className="card-meta">{project.author} · {project.category}</p>
            <div className="card-actions">
              <a className="button small" href={project.demo} target="_blank" rel="noopener noreferrer">Live demo</a>
              <a className="ghost-button small" href={`/projects/${project.slug}`}>Details</a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
