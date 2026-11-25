import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

const items = [
  ["From repository to preview", "Paste a public GitHub URL in the workspace. RepoPlay opens a working Vercel demo when available, or builds a supported frontend from a pinned Git commit."],
  ["Supported projects", "Try plain HTML, CSS and JavaScript sites or compatible React + Vite apps. Choose Frontend demo for a full-stack repository with a supported client. Backend servers, databases and private API keys stay outside the preview."],
  ["A ten-minute session", "Each preview expires after ten minutes. Rendered projects are saved to your private gallery so you can launch a fresh session whenever you like."],
];

export default function About() {
  return (
    <main className="shell page">
      <header className="page-head">
        <span className="eyebrow">About</span>
        <h1>The software behind a repo, <span className="gradient-text">right in your browser</span></h1>
        <p>RepoPlay removes the clone, install and configure loop so you can judge a project in seconds.</p>
      </header>
      <div className="stack">
        {items.map(([title, copy]) => <section className="info-row glass" key={title}><h2>{title}</h2><p>{copy}</p></section>)}
      </div>
      <div style={{ marginTop: 28 }}><Link className="button" href="/workspace">Open workspace</Link></div>
    </main>
  );
}
