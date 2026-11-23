import { TemporaryPreviewForm } from "../components/temporary-preview-form";

export default function HomePage() {
  return (
    <main className="shell workspace">
      <section className="workspace-intro">
        <h1>Preview a repository.</h1>
        <p>Open a public GitHub project in your browser for ten minutes.</p>
        <TemporaryPreviewForm />
      </section>
      <section id="gallery" className="private-gallery" aria-labelledby="gallery-title">
        <div className="gallery-titlebar">
          <div><h2 id="gallery-title">Your projects</h2><p id="gallery-caption">Successfully rendered previews, visible only to you.</p></div>
          <label className="gallery-search" hidden><span className="sr-only">Search your projects</span><input type="search" placeholder="Search projects" /></label>
        </div>
        <p className="gallery-empty" id="gallery-empty" role="status">Checking your account…</p>
        <ul className="history-list" id="history-list" aria-label="Your rendered projects"></ul>
      </section>
    </main>
  );
}
