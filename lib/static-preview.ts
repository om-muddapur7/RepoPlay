import { previewHeaders, readPreviewToken } from "./temporary-preview";

export const STATIC_CONTENT_AUDIENCE = "repoplay-static-content";

const staticTypes: Record<string, string> = {
  html: "text/html; charset=utf-8", css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8", mjs: "text/javascript; charset=utf-8",
  json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon",
  woff: "font/woff", woff2: "font/woff2", avif: "image/avif",
};

export async function serveStaticAsset(request: Request, token: string, segments: string[], secret?: string, publicOrigin?: string) {
  const reply = (message: string, status: number) => new Response(message, { status, headers: previewHeaders });
  const preview = secret && await readPreviewToken(token, secret, STATIC_CONTENT_AUDIENCE);
  if (!preview || !("source" in preview) || preview.source.entry !== "index.html") return reply("Preview not found.", 404);
  if (Date.now() >= preview.expiresAt) return reply("This RepoPlay preview has expired.", 410);
  if (segments.length > 12 || segments.some(segment => !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,119}$/.test(segment))) {
    return reply("File not found.", 404);
  }
  const file = segments.join("/");
  const extension = file.split(".").at(-1)?.toLowerCase() ?? "";
  const type = Object.hasOwn(staticTypes, extension) ? staticTypes[extension] : undefined;
  if (!type) return reply("File type not supported.", 404);
  if (extension === "html" && request.headers.get("sec-fetch-dest") !== "iframe") return reply("Open this preview from RepoPlay.", 404);

  const { owner, name, commit } = preview.source;
  const path = segments.map(encodeURIComponent).join("/");
  const base = `https://raw.githubusercontent.com/${owner}/${name}/${commit}/`;
  const mirror = `https://cdn.jsdelivr.net/gh/${owner}/${name}@${commit}/`;
  const get = (origin: string) => fetch(origin + path, { redirect: "manual", signal: AbortSignal.timeout(5000) }).catch(() => null);
  let upstream = await get(base);
  if (!upstream || (!upstream.ok && upstream.status !== 404)) {
    await upstream?.body?.cancel();
    upstream = await get(mirror);
  }
  if (!upstream?.ok || !upstream.body) return reply("Source file unavailable.", upstream?.status === 404 ? 404 : 502);
  const limit = extension === "html" ? 256 * 1024 : 2 * 1024 * 1024;
  const reader = upstream.body.getReader();
  const pieces: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) return reply("Source file exceeds the preview size limit.", 413);
      pieces.push(new Uint8Array(value));
    }
  } catch {
    return reply("Source download failed.", 502);
  } finally {
    await reader.cancel();
  }
  if (Date.now() >= preview.expiresAt) return reply("This RepoPlay preview has expired.", 410);

  const scope = `${new URL(publicOrigin ?? request.url).origin}/static-preview/${token}/`;
  const csp = extension === "html"
    ? `sandbox allow-scripts; default-src 'none'; script-src ${scope} ${mirror} data: 'unsafe-inline'; style-src ${scope} ${mirror} 'unsafe-inline'; img-src ${scope} ${mirror} data:; font-src ${scope} ${mirror} data:; connect-src ${scope} ${mirror}; frame-ancestors 'self'; form-action 'none'; base-uri 'none'`
    : "sandbox; default-src 'none'";
  const headers = {
    ...previewHeaders, "Content-Type": type, "Content-Security-Policy": csp,
    "Access-Control-Allow-Origin": "*",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
  const asset = new Blob(pieces);
  if (extension !== "html") return new Response(asset, { headers });
  // A private Sites session is unavailable to asset requests from an opaque iframe.
  const cdnPage = new URL(path, mirror);
  const rawHtml = await asset.text();
  const scriptUrls = new Map<string, string>();
  const scripts = [...rawHtml.matchAll(/<script\b[^>]*?\ssrc\s*=\s*(["'])([^"']+)\1[^>]*>/gi)].slice(0, 12);
  await Promise.all(scripts.map(async ([tag, , value]) => {
    if (/\btype\s*=/i.test(tag)) return;
    try {
      const target = new URL(value, cdnPage);
      if (!target.href.startsWith(mirror)) return;
      const response = await get(target.href);
      if (!response?.ok || Number(response.headers.get("content-length")) > 256 * 1024) return;
      const script = await response.text();
      const navigation = /\b(?:window\.)?location\.href(?=\s*=(?!=))/g;
      if (script.length > 256 * 1024 || !script.match(navigation)) return;
      scriptUrls.set(target.href, "data:text/javascript;charset=utf-8," + encodeURIComponent(script.replace(navigation, "window.__repoPlayLocation.href")).replaceAll("'", "%27"));
    } catch { /* Keep the pinned CDN URL if the script cannot be prepared. */ }
  }));
  const html = rawHtml.replace(
    /(<(?:script|img)\b[^>]*?\s+src\s*=\s*|<link\b[^>]*?\s+href\s*=\s*)(["'])([^"']+)\2/gi,
    (attribute, prefix: string, quote: string, value: string) => {
      try {
        const target = new URL(value, cdnPage);
        return target.href.startsWith(mirror) ? prefix + quote + (prefix.toLowerCase().startsWith("<script") ? scriptUrls.get(target.href) ?? target.href : target.href) + quote : attribute;
      } catch {
        return attribute;
      }
    },
  );
  const images = `<script>(()=>{const base=${JSON.stringify(cdnPage.href)},root=${JSON.stringify(mirror)};function navigate(value){try{const target=new URL(value,location.href);if(target.origin===location.origin&&target.pathname.startsWith(location.pathname.split("/").slice(0,3).join("/")+"/")&&target.pathname.endsWith(".html")){parent.postMessage({type:"repoplay:navigate",path:target.pathname+target.search+target.hash},"*");return;}}catch{}location.href=value;}Object.defineProperty(window,"__repoPlayLocation",{value:{set href(value){navigate(value);}}});document.addEventListener("click",event=>{const link=event.target.closest?.("a[href]");if(!link||link.target||link.hasAttribute("download")||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const target=new URL(link.href);if(target.origin===location.origin&&target.pathname.startsWith(location.pathname.split("/").slice(0,3).join("/")+"/")&&target.pathname.endsWith(".html")){event.preventDefault();navigate(link.href);}});new MutationObserver(()=>{for(const image of document.images){try{const target=new URL(image.getAttribute("src"),base);if(target.href.startsWith(root)&&image.getAttribute("src")!==target.href)image.src=target.href;}catch{}}}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["src"]});})();</script>`;
  const notify = `<script>window.addEventListener("load",()=>{if(document.body?.innerText.trim()||document.body?.querySelector("canvas,svg,img,video,input"))window.parent.postMessage("repoplay:rendered","*");});</script>`;
  const content = /<\/body\s*>/i.test(html) ? html.replace(/<\/body\s*>/i, tag => notify + tag) : html + notify;
  return new Response(content.replace(/<head\b[^>]*>/i, tag => tag + images), { headers });
}
