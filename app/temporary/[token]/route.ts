import { previewHeaders, readPreviewToken } from "../../../lib/temporary-preview";
import { sourcePreviewRuntime } from "../../../lib/source-preview-runtime";
import { authContext, type AuthEnv } from "../../../lib/repoplay-auth";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return authenticatedViewer(request, token, process.env);
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
  if ("source" in preview && new URL(request.url).searchParams.has("source")) {
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
  const frameHref = "origin" in preview ? preview.origin + "/" : "?source=1";
  const framePolicy = "origin" in preview ? preview.origin : "'self'";
  const frameSandbox = "origin" in preview ? "allow-scripts allow-same-origin" : "allow-scripts";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Temporary preview · RepoPlay</title>
  <style nonce="${nonce}">body{margin:0;background:#0b1020;color:#f4f7fe;font:16px system-ui}header{padding:14px 20px;display:flex;gap:18px;align-items:center}a{color:#81edc4}iframe{display:block;width:100%;height:calc(100dvh - 60px);border:0;background:white}p{padding:20px}</style></head>
  <body><header><a href="/">RepoPlay</a><strong id="status">Temporary preview</strong></header>
  <iframe title="Repository preview" src="${frameHref}" sandbox="${frameSandbox}" referrerpolicy="no-referrer"></iframe>
  <script nonce="${nonce}">
  const expiry = ${preview.expiresAt};
  const frame = document.querySelector('iframe');
  const status = document.getElementById('status');
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
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; frame-src ${framePolicy}; frame-ancestors 'none'; base-uri 'none'`,
    },
  });
}
