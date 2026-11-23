import { createPreviewToken, PREVIEW_DURATION_MS, previewHeaders, readPreviewToken } from "../../../lib/temporary-preview";
import { sourcePreviewRuntime } from "../../../lib/source-preview-runtime";
import { authContext, type AuthEnv } from "../../../lib/repoplay-auth";
import { galleryEntries } from "../../../lib/gallery-history";
import { STATIC_CONTENT_AUDIENCE } from "../../../lib/static-preview";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return authenticatedViewer(request, token, process.env);
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return recordRenderedPreview(request, (await params).token, process.env);
}

async function recordRenderedPreview(request: Request, token: string, env: AuthEnv) {
  const auth = authContext(request, env);
  const missing = () => auth.apply(new Response("Preview not found.", { status: 404 }));
  if (!auth.client || request.headers.get("origin") !== auth.origin || !env.PREVIEW_SIGNING_SECRET) return missing();
  const user = await auth.user();
  if (!user) return missing();
  const preview = await readPreviewToken(token, env.PREVIEW_SIGNING_SECRET, user.id);
  if (!preview || preview.expiresAt <= Date.now()) return missing();
  const repository = "source" in preview
    ? `https://github.com/${preview.source.owner}/${preview.source.name}` : preview.repository;
  if (!repository) return missing();
  const projects = galleryEntries(user.user_metadata.repoplay_rendered)
    .filter(item => item.repository.toLowerCase() !== repository.toLowerCase());
  const { error } = await auth.client.auth.updateUser({
    data: { repoplay_rendered: [{ repository, description: preview.description, renderedAt: Date.now() }, ...projects].slice(0, 100) },
  });
  return auth.apply(new Response(null, { status: error ? 503 : 204 }));
}

async function authenticatedViewer(request: Request, token: string, env: AuthEnv & { PREVIEW_SIGNING_SECRET?: string }) {
  const auth = authContext(request, env);
  const userId = await auth.userId();
  return auth.apply(userId
    ? await serveTemporaryPreview(request, token, env.PREVIEW_SIGNING_SECRET, userId)
    : new Response("Preview not found.", { status: 404, headers: previewHeaders }));
}

async function serveTemporaryPreview(request: Request, token: string, secret: string | undefined, userId: string) {
  const preview = secret && await readPreviewToken(token, secret, userId);
  if (!preview) return new Response("Preview not found.", { status: 404, headers: previewHeaders });
  if (Date.now() >= preview.expiresAt) return new Response("This RepoPlay preview has expired.", { status: 410, headers: previewHeaders });

  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
  const staticSource = "source" in preview && preview.source.entry === "index.html" ? preview.source : null;
  if (!staticSource && "source" in preview && new URL(request.url).searchParams.has("source")) {
    const source = JSON.stringify({ ...preview.source, expiresAt: preview.expiresAt });
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Source preview</title></head>
      <body><p id="build-status" role="status">Building project from GitHub…</p><div id="root"></div>
      <script nonce="${nonce}">window.repoPlaySource = ${source};</script>
      <script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/esbuild-wasm@0.25.12/lib/browser.min.js"></script>
      <script nonce="${nonce}">(${sourcePreviewRuntime.toString()})();</script></body></html>`, {
      headers: {
        ...previewHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": `sandbox allow-scripts; default-src 'none'; base-uri 'none'; frame-ancestors 'self'; script-src 'nonce-${nonce}' 'wasm-unsafe-eval' data: https://esm.sh; connect-src https://raw.githubusercontent.com https://cdn.jsdelivr.net; worker-src blob:; style-src data: 'unsafe-inline'; img-src data: blob:; font-src data:; form-action 'none'`,
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
  <style nonce="${nonce}">:root{color-scheme:dark;--bg:#05070d;--panel:#101a2c;--text:#edf4ff;--accent:#a6c6ff;--border:#2a4166}:root[data-theme=light]{color-scheme:light;--bg:#edf3fc;--panel:#f8fbff;--text:#14213a;--accent:#244e99;--border:#c6d5ed}body{margin:0;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg);color:var(--text);font:16px system-ui}header{padding:12px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;background:var(--panel);border-bottom:1px solid var(--border)}a{color:var(--accent)}button{border:1px solid var(--border);border-radius:8px;padding:7px 10px;background:var(--bg);color:var(--text);font:inherit;cursor:pointer}iframe{display:block;width:100%;flex:1;border:0;background:white}#save-status{font-size:.875rem}</style></head>
  <body><header><a href="/workspace#gallery">RepoPlay</a><strong id="status">Temporary preview</strong>${"origin" in preview ? '<button id="confirm" hidden>Preview is visible</button>' : ""}<span role="status" id="save-status"></span></header>
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
      if (event.source === frame.contentWindow && event.origin === 'null' && event.data === 'repoplay:rendered') save();
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
