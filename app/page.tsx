import { AboutSection } from "../components/about-section";
import { PlansSection } from "../components/plans-section";
import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { SampleProjects } from "../components/sample-projects";

export default function HomePage() {
  return (
    <main className="nest-home">
      <header className="reference-hero" id="home">
        <h1>Welcome to<br /><span>RepoPlay</span></h1>
        <p>Turn public GitHub repositories into interactive demos. Preview static sites and compatible React frontends right in your browser.</p>
        <div className="hero-actions">
          <Link className="button" href="/workspace">Preview a repository</Link>
          <Show when="signed-out"><SignUpButton mode="modal"><button type="button" className="ghost-button">Sign up now</button></SignUpButton></Show>
        </div>
        <p className="reference-note">Start with two free previews</p>
      </header>
      <section className="shell section" aria-labelledby="sample-title">
        <div className="reference-heading"><h2 id="sample-title">Explore sample projects</h2><p>Try these live demos to see what you can explore with RepoPlay.</p></div>
        <SampleProjects />
      </section>
      <AboutSection embedded />
      <PlansSection embedded />
    </main>
  );
}
