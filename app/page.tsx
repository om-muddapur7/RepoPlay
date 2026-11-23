import { Gallery } from "../components/gallery";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="shell">
          <h1>Discover software.<br /><span>Try it live.</span></h1>
          <p>Explore open-source projects through working demos you can launch right from your browser.</p>
          <a className="button" href="#gallery">Browse demos</a>
        </div>
      </section>
      <Gallery />
    </main>
  );
}
