import { previewHeaders, readPreviewToken } from "../../../lib/temporary-preview";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return serveTemporaryPreview(token, process.env.PREVIEW_SIGNING_SECRET);
}

async function serveTemporaryPreview(token: string, secret: string | undefined) {
  const preview = secret && await readPreviewToken(token, secret);
  if (!preview) return new Response("Preview not found.", { status: 404, headers: previewHeaders });
  if (Date.now() >= preview.expiresAt) return new Response("This RepoPlay preview has expired.", { status: 410, headers: previewHeaders });

  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Temporary preview · RepoPlay</title>
  <style nonce="${nonce}">body{margin:0;background:#0b1020;color:#f4f7fe;font:16px system-ui}header{padding:14px 20px;display:flex;gap:18px;align-items:center}a{color:#81edc4}iframe{display:block;width:100%;height:calc(100dvh - 60px);border:0;background:white}p{padding:20px}</style></head>
  <body><header><a href="/">RepoPlay</a><strong id="status">Temporary preview</strong></header>
  <iframe title="Repository preview" src="${preview.origin}/" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"></iframe>
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
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; frame-src ${preview.origin}; frame-ancestors 'none'; base-uri 'none'`,
    },
  });
}
