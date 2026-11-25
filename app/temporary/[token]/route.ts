import { createPreviewToken, isExpenseTrackerDemo, PREVIEW_DURATION_MS, previewHeaders, readPreviewToken } from "../../../lib/temporary-preview";
import { sourcePreviewRuntime } from "../../../lib/source-preview-runtime";
import { readPrivate, session, writePrivate } from "../../../lib/account";
import { STATIC_CONTENT_AUDIENCE } from "../../../lib/static-preview";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return authenticatedViewer(request, token, process.env);
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return recordRenderedPreview(request, (await params).token, process.env);
}

async function recordRenderedPreview(request: Request, token: string, env: Record<string, string | undefined>) {
  const missing = () => new Response("Preview not found.", { status: 404 });
  if (request.headers.get("origin") !== new URL(request.url).origin || !env.PREVIEW_SIGNING_SECRET) return missing();
  const current = await session();
  if (!current) return missing();
  const preview = await readPreviewToken(token, env.PREVIEW_SIGNING_SECRET, current.userId);
  if (!preview || preview.expiresAt <= Date.now()) return missing();
  const repository = "source" in preview
    ? `https://github.com/${preview.source.owner}/${preview.source.name}` : preview.repository;
  if (!repository) return missing();
  const { projects: existing } = await readPrivate(current.userId);
  const projects = existing.filter(item => item.repository.toLowerCase() !== repository.toLowerCase());
  await writePrivate(current.userId, {
    repoplay_rendered: [{ repository, description: preview.description, renderedAt: Date.now(), mode: "source" in preview && preview.source.frontendOnly ? "frontend" : undefined }, ...projects].slice(0, 100),
  });
  return new Response(null, { status: 204 });
}

async function authenticatedViewer(request: Request, token: string, env: Record<string, string | undefined>) {
  const current = await session();
  return current
    ? serveTemporaryPreview(request, token, env.PREVIEW_SIGNING_SECRET, current.userId)
    : new Response("Preview not found.", { status: 404, headers: previewHeaders });
}

async function serveTemporaryPreview(request: Request, token: string, secret: string | undefined, userId: string) {
  const preview = secret && await readPreviewToken(token, secret, userId);
  if (!preview) return new Response("Preview not found.", { status: 404, headers: previewHeaders });
  if (Date.now() >= preview.expiresAt) return new Response("This RepoPlay preview has expired.", { status: 410, headers: previewHeaders });

  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
  const staticSource = "source" in preview && preview.source.entry === "index.html" ? preview.source : null;
  if (!staticSource && "source" in preview && new URL(request.url).searchParams.has("source")) {
    const expenseTrackerDemo = isExpenseTrackerDemo(preview.source);
    const source = JSON.stringify({ ...preview.source, expenseTrackerDemo, expiresAt: preview.expiresAt });
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Source preview</title></head>
      <body><p id="build-status" role="status">Building project from GitHub…</p><div id="root"></div>
      <script nonce="${nonce}">window.repoPlaySource = ${source};</script>
      ${expenseTrackerDemo ? `<script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.0"></script>` : ""}
      <script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/esbuild-wasm@0.25.12/lib/browser.min.js"></script>
      <script nonce="${nonce}">(${sourcePreviewRuntime.toString()})();</script></body></html>`, {
      headers: {
        ...previewHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": `sandbox allow-scripts; default-src 'none'; base-uri 'none'; frame-ancestors 'self'; script-src 'nonce-${nonce}' 'wasm-unsafe-eval' data: https://esm.sh; connect-src https://raw.githubusercontent.com https://cdn.jsdelivr.net; worker-src blob:; style-src data: 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; form-action 'none'`,
      },
    });
  }
  const staticGrant = staticSource
    ? await createPreviewToken({ source: staticSource }, preview.expiresAt - PREVIEW_DURATION_MS, secret!, STATIC_CONTENT_AUDIENCE)
    : null;
  const frameHref = staticGrant ? `/static-preview/${staticGrant.token}/index.html` : "origin" in preview ? preview.origin + "/" : "?source=1";
  const framePolicy = "origin" in preview ? preview.origin : "'self'";
  const frameSandbox = "origin" in preview ? "allow-scripts allow-same-origin" : "allow-scripts";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Temporary preview · RepoPlay</title>
  <style nonce="${nonce}">:root{color-scheme:dark;--bg:#151616;--panel:rgb(255 255 255/.06);--text:#f1f5ff;--muted:#9aa8c4;--accent:#8dc6a2;--border:rgb(255 255 255/.12)}:root[data-theme=light]{color-scheme:light;--bg:#fafafa;--panel:rgb(255 255 255/.8);--text:#191a19;--muted:#4b5a7a;--accent:#276549;--border:rgb(15 23 60/.12)}body{margin:0;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg);color:var(--text);font:15px/1.5 ui-sans-serif,system-ui,sans-serif}header{min-height:48px;box-sizing:border-box;padding:10px 20px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;background:var(--panel);border-bottom:1px solid var(--border)}a{color:var(--text);text-decoration:none;font-weight:750;letter-spacing:-.02em}a::before{content:"← ";color:var(--accent)}button{border:1px solid var(--border);border-radius:10px;padding:7px 12px;background:var(--panel);color:var(--text);font:inherit;cursor:pointer}#status{padding:4px 12px;border-radius:6px;background:var(--panel);border:1px solid var(--border);font-size:.84rem;font-weight:600}iframe{display:block;width:100%;flex:1;border:0;background:white}#save-status,header span{font-size:.84rem;color:var(--muted)}</style></head>
  <body><header><a href="/workspace#gallery">Workspace</a><strong id="status">Temporary preview</strong>${"origin" in preview ? '<button id="confirm" hidden>Preview is visible</button>' : ""}${"source" in preview && preview.source.frontendOnly ? '<span>Frontend demo · Backend services disabled</span>' : ""}<span role="status" id="save-status"></span></header>
  <iframe title="Repository preview" src="${frameHref}" sandbox="${frameSandbox}" referrerpolicy="no-referrer"></iframe>
  <script nonce="${nonce}">
  try { document.documentElement.dataset.theme = localStorage.getItem('repoplay-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch {}
  const expiry = ${preview.expiresAt};
  const frame = document.querySelector('iframe');
  const status = document.getElementById('status');
  const confirmation = document.getElementById('confirm');
  let saved = false;
  async function save() {
    if (saved || Date.now() >= expiry) return;
    saved = true;
    const result = document.getElementById('save-status');
    const write = () => fetch(location.pathname, { method: 'POST' });
    try {
      const response = await (navigator.locks ? navigator.locks.request('repoplay-gallery', write) : write());
      if (!response.ok) throw new Error('Save failed');
      if (confirmation) confirmation.hidden = true;
      result.textContent = 'Saved to your gallery';
    } catch {
      saved = false;
      result.textContent = 'Could not save to your gallery';
    }
  }
  if (confirmation) {
    frame.addEventListener('load', () => { confirmation.hidden = false; });
    confirmation.addEventListener('click', save);
  } else {
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || event.origin !== 'null') return;
      if (event.data === 'repoplay:rendered') save();
      const root = ${JSON.stringify(staticGrant ? `/static-preview/${staticGrant.token}/` : null)};
      if (!root || Date.now() >= expiry || event.data?.type !== 'repoplay:navigate' || typeof event.data.path !== 'string' || !event.data.path.startsWith(root)) return;
      const url = new URL(event.data.path, location.origin);
      if (url.origin === location.origin && url.pathname.startsWith(root) && url.pathname.endsWith('.html')) frame.src = url.href;
    });
  }
  function update() {
    const seconds = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
    status.textContent = seconds ? 'Preview expires in ' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') : 'Preview expired';
    if (!seconds) frame.remove();
  }
  update();
  setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
  </script></body></html>`;
  return new Response(html, {
    headers: {
      ...previewHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; frame-src ${framePolicy}; frame-ancestors 'none'; base-uri 'none'`,
    },
  });
}
