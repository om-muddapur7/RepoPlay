import { TemporaryPreviewForm } from "../../components/temporary-preview-form";
import { ProjectArt } from "../../components/project-art";
import { projects } from "../../lib/catalog";

export default function WorkspacePage() {
  return (
    <main className="workspace-layout">
      <aside className="workspace-sidebar">
        <div className="workspace-identity"><span aria-hidden="true">R</span><div><strong>Workspace</strong><p id="workspace-display-name">RepoPlay</p></div></div>
        <nav aria-label="Workspace navigation">
          <a href="#preview">Preview a repository</a>
          <a href="#gallery">Your projects</a>
          <a href="#sample-projects">Sample projects</a>
          <a href="/profile">Profile &amp; plan</a>
        </nav>
      </aside>
      <div className="workspace workspace-main">
      <section className="workspace-intro" id="preview" aria-labelledby="preview-title">
        <h1 id="preview-title">Preview a repository</h1>
        <p>Paste a public GitHub link to open a temporary demo.</p>
        <TemporaryPreviewForm />
      </section>
      <section id="gallery" className="private-gallery" aria-labelledby="gallery-title">
        <div className="gallery-titlebar">
          <div><h2 id="gallery-title">Your projects</h2><p id="gallery-caption">Successfully rendered previews, visible only to you.</p></div>
          <label className="gallery-search" hidden><span className="sr-only">Search your projects</span><input type="search" placeholder="Search projects" /></label>
        </div>
        <p className="gallery-empty" id="gallery-empty" role="status">Checking your account…</p>
        <p id="gallery-notice" role="status"></p>
        <ul className="history-list" id="history-list" aria-label="Your rendered projects"></ul>
      </section>
      <section id="sample-projects" className="private-gallery" aria-labelledby="sample-title">
        <div className="gallery-titlebar">
          <div><h2 id="sample-title">Sample projects</h2><p>Three interactive demos to try.</p></div>
        </div>
        <ul className="history-list sample-list">
          {projects.map(project => (
            <li key={project.slug}>
              <ProjectArt theme={project.theme} />
              <div className="gallery-card-body">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="gallery-card-actions">
                  <a className="quiet-button" href={project.demo} target="_blank" rel="noopener noreferrer">Open demo</a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </main>
  );
}
