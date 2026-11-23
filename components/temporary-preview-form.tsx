"use client";

import { useState, type FormEvent } from "react";

export function TemporaryPreviewForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ path: string; expiresAt: number } | null>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPreview(null);
    setPending(true);
    const repository = new FormData(event.currentTarget).get("repository");
    try {
      const response = await fetch("/api/temporary-previews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository }),
      });
      const body = await response.json();
      if (!response.ok) setError(body.error);
      else setPreview(body);
    } catch {
      setError("Could not create a preview. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="shell py-10" aria-labelledby="temporary-title">
      <h2 id="temporary-title" className="text-2xl font-bold">Create a 10-minute preview</h2>
      <p className="mt-2 text-[var(--muted)]">Paste a public GitHub repository. RepoPlay opens its Vercel site or builds a supported React + Vite app from source.</p>
      <form className="mt-4 flex flex-wrap items-center gap-3" onSubmit={create}>
        <label className="search grow" htmlFor="repository"><span className="sr-only">GitHub repository URL</span>
          <input id="repository" name="repository" type="url" placeholder="https://github.com/owner/repo" required maxLength={256} />
        </label>
        <button className="button" type="submit" disabled={pending}>{pending ? "Checking repository…" : "Create preview"}</button>
      </form>
      {error && <p className="mt-3" role="alert">{error}</p>}
      {preview && <p className="mt-4 flex flex-wrap items-center gap-3" role="status">
        <a className="button" href={preview.path} target="_blank" rel="noopener noreferrer">Open temporary preview</a>
        <span>Expires at {new Date(preview.expiresAt).toLocaleTimeString()}.</span>
      </p>}
    </section>
  );
}
