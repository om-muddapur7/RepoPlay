"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { planNames, type PlanTier } from "../lib/plans";

type Project = { repository: string; renderedAt: number; description?: string; mode?: "frontend" };
type Account = { name: string; avatar: string; paid: boolean; tier: PlanTier; used: number; limit: number | null };

export function Workspace({ initialRepository = "" }: { initialRepository?: string }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [repository, setRepository] = useState(initialRepository);
  const [frontend, setFrontend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ text?: string; path?: string; upgrade?: boolean; error?: boolean } | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setAccount(data.account);
      setProjects(data.projects);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
    const refresh = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [load]);

  async function create(repo: string, frontendOnly: boolean, inspect = false) {
    setBusy(true);
    setResult({ text: "Checking GitHub for a deployment or compatible frontend…" });
    try {
      const request = () => fetch("/api/temporary-previews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository: repo, action: inspect ? "inspect" : undefined, mode: frontendOnly ? "frontend" : undefined }),
      });
      const response = await (!inspect && navigator.locks ? navigator.locks.request("repoplay-create-preview", request) : request());
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setResult({ text: data.error ?? "Could not create a preview.", error: true, upgrade: Boolean(data.upgrade) });
      else if (inspect) setResult({ text: data.report });
      else { setResult({ text: "Preview link created. Open it to load the demo.", path: data.path }); load(); }
    } catch {
      setResult({ text: "Could not create a preview. Try again.", error: true });
    } finally {
      setBusy(false);
    }
  }

  async function remove(project: Project, name: string) {
    if (!window.confirm(`Remove ${name} from your gallery?`)) return;
    const write = () => fetch("/api/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repository: project.repository }) });
    try {
      const response = await (navigator.locks ? navigator.locks.request("repoplay-gallery", write) : write());
      if (!response.ok) throw new Error();
      await load();
    } catch {
      setResult({ text: "Could not delete the project. Try again.", error: true });
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(project => new URL(project.repository).pathname.toLowerCase().includes(q));
  }, [projects, query]);

  const firstName = account?.name.split(" ")[0];
  const percent = account?.limit ? Math.min(100, (account.used / account.limit) * 100) : 0;

  return (
    <>
      <header className="dash-head">
        <div>
          <h1>{firstName ? `Welcome back, ${firstName}` : "Workspace"}</h1>
          <p>Paste a public GitHub link to open a temporary demo.</p>
        </div>
        {account && <span className={`plan-chip${account.paid ? " pro" : ""}`}>{planNames[account.tier]}</span>}
      </header>

      <section className="panel glass" id="preview" aria-labelledby="preview-title">
        <h2 id="preview-title">Preview a repository</h2>
        <p className="sub">Works with static sites, React + Vite, and Create React App projects.</p>
        <form onSubmit={event => { event.preventDefault(); create(repository.trim(), frontend); }}>
          <div className="input-row">
            <label className="sr-only" htmlFor="repository">GitHub repository URL</label>
            <input id="repository" className="field" type="url" required maxLength={256} placeholder="https://github.com/owner/repo" value={repository} onChange={event => setRepository(event.target.value)} />
          </div>
          <div className="preview-controls">
            {account?.paid
              ? <label className="check"><input type="checkbox" checked={frontend} onChange={event => setFrontend(event.target.checked)} /> Frontend demo (skip backend services)</label>
              : account && <Link className="check" href="/plans#checkout">Frontend demos require Basic or Premium</Link>}
            <div className="preview-actions">
              <button className="ghost-button" type="button" disabled={busy || (frontend && account?.tier !== "premium")} onClick={event => {
                if (event.currentTarget.form?.reportValidity()) void create(repository.trim(), frontend, true);
              }}>Check compatibility</button>
              <button className="button" type="submit" disabled={busy}>Create preview</button>
            </div>
          </div>
          {frontend && account?.tier === "basic" && <p className="sub">Frontend compatibility checks are available on Premium. You can still create a frontend preview on Basic.</p>}
        </form>
        {result && (
          <div className={`result preview-outcome${result.error ? " error" : ""}`}>
            <p role="status">{result.text}</p>
            {result.path && <a className="button" href={result.path}>Open preview <span aria-hidden="true">→</span></a>}
            {result.upgrade && <Link className="button" href="/plans#checkout">Upgrade</Link>}
          </div>
        )}
        {account && account.limit !== null && (
          <div className="meter">
            <div className="meter-top"><span>{planNames[account.tier]} previews used</span><span>{Math.min(account.used, account.limit)} / {account.limit}</span></div>
            <div className="meter-bar" role="progressbar" aria-valuemin={0} aria-valuemax={account.limit} aria-valuenow={Math.min(account.used, account.limit)}><i style={{ width: `${percent}%` }} /></div>
          </div>
        )}
      </section>

      <section id="gallery" aria-labelledby="gallery-title">
        <div className="gallery-head">
          <div><h2 id="gallery-title">Your projects</h2><p>Successfully rendered previews, visible only to you.</p></div>
          {projects.length > 0 && <><label className="sr-only" htmlFor="project-search">Search your projects</label><input id="project-search" className="field" type="search" placeholder="Search projects" value={query} onChange={event => setQuery(event.target.value)} /></>}
        </div>
        {!loaded && <p className="empty glass" role="status">Loading your projects…</p>}
        {loaded && failed && <p className="empty glass" role="status">Your gallery is temporarily unavailable.</p>}
        {account && !account.paid && <p className="empty glass">The private gallery is included with Basic and Premium. <Link href="/plans#checkout">View plans</Link></p>}
        {loaded && !failed && account?.paid && visible.length === 0 && <p className="empty glass" role="status">{query ? "No projects match your search." : "Your gallery is empty. Create a preview to add your first project."}</p>}
        <ul className="project-grid">
          {visible.map(project => {
            const [owner, name] = new URL(project.repository).pathname.slice(1).split("/");
            return (
              <li key={project.repository} className="project-card glass">
                <div className="thumb" aria-hidden="true">
                  <span>{name.slice(0, 2).toUpperCase()}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://opengraph.githubassets.com/1/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`} alt="" loading="lazy" referrerPolicy="no-referrer" onError={event => event.currentTarget.remove()} />
                </div>
                <div className="card-body">
                  <h3>{name}</h3>
                  <p className="card-meta" style={{ paddingTop: 0 }}>{owner} · {new Date(project.renderedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                  <p>{project.description || "Open a fresh preview of this GitHub project."}</p>
                  <div className="card-actions">
                    <button className="button small" type="button" disabled={busy} onClick={() => { setRepository(project.repository); setFrontend(project.mode === "frontend"); create(project.repository, project.mode === "frontend"); }}>Preview again</button>
                    <button className="ghost-button small danger" type="button" aria-label={`Delete ${name} from your gallery`} onClick={() => remove(project, name)}>Delete</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
