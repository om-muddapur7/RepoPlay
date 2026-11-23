import { fetchHomepage, isHtml, previewHeaders, readPreviewToken } from "../../../lib/temporary-preview";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return serveTemporaryPreview(request, token, process.env.PREVIEW_SIGNING_SECRET);
}

async function serveTemporaryPreview(request: Request, token: string, secret: string | undefined) {
  const preview = secret && await readPreviewToken(token, secret);
  if (!preview) return new Response("Preview not found.", { status: 404, headers: previewHeaders });
  if (Date.now() >= preview.expiresAt) return new Response("This RepoPlay preview has expired.", { status: 410, headers: previewHeaders });

  if (new URL(request.url).searchParams.has("document")) {
    try {
      const upstream = await fetchHomepage(preview.origin);
      if (!isHtml(upstream)) return new Response("Demo unavailable.", { status: 502, headers: previewHeaders });
      const reader = upstream.body?.getReader();
      if (!reader) return new Response("Demo unavailable.", { status: 502, headers: previewHeaders });
      const decoder = new TextDecoder();
      let html = "";
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 256 * 1024) return new Response("Demo HTML exceeds the preview limit.", { status: 422, headers: previewHeaders });
          html += decoder.decode(value, { stream: true });
        }
      } finally {
        await reader.cancel();
      }
      html += decoder.decode();
      const head = /<head(?:\s[^>]*)?>/i;
      if (!head.test(html)) return new Response("The demo requires an HTML head.", { status: 422, headers: previewHeaders });
      if (Date.now() >= preview.expiresAt) return new Response("This RepoPlay preview has expired.", { status: 410, headers: previewHeaders });
      const origin = preview.origin;
      return new Response(html.replace(head, (tag) => `${tag}<base href="${origin}/">`), {
        headers: {
          ...previewHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": `sandbox allow-scripts; default-src 'none'; base-uri ${origin}; frame-ancestors 'self'; script-src ${origin} 'unsafe-inline'; style-src ${origin} 'unsafe-inline'; img-src ${origin} data:; font-src ${origin} data:; media-src ${origin}; connect-src ${origin}; form-action 'none'`,
        },
      });
    } catch {
      return new Response("Demo unavailable.", { status: 502, headers: previewHeaders });
    }
  }

  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Temporary preview · RepoPlay</title>
  <style nonce="${nonce}">body{margin:0;background:#0b1020;color:#f4f7fe;font:16px system-ui}header{padding:14px 20px;display:flex;gap:18px;align-items:center}a{color:#81edc4}iframe{display:block;width:100%;height:calc(100dvh - 60px);border:0;background:white}p{padding:20px}</style></head>
  <body><header><a href="/">RepoPlay</a><strong id="status">Temporary preview</strong></header>
  <iframe title="Repository preview" src="?document=1" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>
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
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; frame-src 'self'; frame-ancestors 'none'; base-uri 'none'`,
    },
  });
}
