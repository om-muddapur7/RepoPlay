export default function About() {
  return <main className="shell studio"><header><h1>About <span className="accent">RepoPlay</span></h1><p>Explore the software behind a public GitHub repository, right in your browser.</p></header>
    <div className="story-list">{[
      ["From repository to preview", "Paste a public GitHub URL in the workspace. RepoPlay opens a working Vercel demo when available, or builds a supported frontend from a pinned Git commit."],
      ["Supported projects", "Try plain HTML, CSS and JavaScript sites or compatible React + Vite apps. Choose Frontend demo for a full-stack repository with a supported client. Backend servers, databases and private API keys stay outside the preview."],
      ["A ten-minute session", "Each preview expires after ten minutes. Sign in with Google to keep successfully rendered projects in your private gallery and launch a fresh session later."],
    ].map(([title, copy]) => <section key={title}><h2>{title}</h2><p>{copy}</p></section>)}</div><a className="button" href="/workspace">Open workspace</a></main>
}
