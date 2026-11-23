"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, projects } from "../lib/catalog";
import { ProjectArt } from "./project-art";

export function Gallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All projects");
  const results = projects.filter((project) => {
    const searchableText = `${project.title} ${project.description} ${project.technology}`.toLowerCase();
    return (category === "All projects" || category === project.category)
      && searchableText.includes(query.trim().toLowerCase());
  });

  return (
    <section id="gallery" className="shell gallery" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <div><h2 id="gallery-title">Explore projects</h2><p>A starter catalog of open-source demos.</p></div>
        <label className="search">
          <span className="sr-only">Search projects</span>
          <input type="search" placeholder="Search projects…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      <div className="filters" role="group" aria-label="Filter by category">
        {["All projects", ...categories].map((option) => (
          <button key={option} type="button" aria-pressed={category === option} onClick={() => setCategory(option)}>
            {option}
          </button>
        ))}
      </div>
      <p className="result-count" role="status">{results.length} {results.length === 1 ? "project" : "projects"}</p>
      {results.length === 0 && <p className="empty">No projects match your search. Try a different term or category.</p>}
      <div className="project-grid">
        {results.map((project) => (
          <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug}>
            <ProjectArt theme={project.theme} />
            <div className="card-content">
              <p className="category">{project.category}</p>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="card-meta"><span>{project.technology}</span><span>{project.author}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
