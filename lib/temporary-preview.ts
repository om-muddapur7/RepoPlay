export const PREVIEW_DURATION_MS = 10 * 60 * 1000;

export function repositoryFromUrl(input: string) {
  try {
    const url = new URL(input);
    if (url.origin !== "https://github.com" || url.username || url.password || url.search || url.hash) return null;
    const match = /^\/([a-z\d-]{1,39})\/([a-z\d_.-]{1,100})\/?$/i.exec(url.pathname);
    if (!match) return null;
    const name = match[2].replace(/\.git$/i, "");
    return name && name !== "." && name !== ".." ? { owner: match[1], name } : null;
  } catch {
    return null;
  }
}

export function supportedHomepage(input: unknown) {
  if (typeof input !== "string" || input.length > 512) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.port || url.username || url.password ||
      !/^[a-z0-9][a-z0-9-]*\.vercel\.app$/.test(url.hostname) ||
      url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

type Preview = { origin: string; expiresAt: number };

const encoder = new TextEncoder();

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decode(text: string) {
  return Uint8Array.from(atob(text.replaceAll("-", "+").replaceAll("_", "/")), char => char.charCodeAt(0));
}

function signingKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createPreviewToken(origin: string, now: number, secret: string) {
  const expiresAt = now + PREVIEW_DURATION_MS;
  const body = encode(encoder.encode(JSON.stringify({ origin, expiresAt })));
  const signature = await crypto.subtle.sign("HMAC", await signingKey(secret), encoder.encode(body));
  return { token: body + "." + encode(new Uint8Array(signature)), expiresAt };
}

export async function readPreviewToken(token: string, secret: string): Promise<Preview | null> {
  if (token.length > 1024 || !/^[\w-]+\.[\w-]{43}$/.test(token)) return null;
  const [body, provided] = token.split(".");
  try {
    const bytes = decode(provided);
    if (encode(bytes) !== provided ||
      !await crypto.subtle.verify("HMAC", await signingKey(secret), bytes, encoder.encode(body))) return null;
    const item = JSON.parse(new TextDecoder().decode(decode(body)));
    const origin = supportedHomepage(item.origin);
    return origin && Number.isSafeInteger(item.expiresAt) ? { origin, expiresAt: item.expiresAt } : null;
  } catch {
    return null;
  }
}

export function fetchHomepage(origin: string) {
  return fetch(origin + "/", { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(6000) });
}

export function isHtml(response: Response) {
  return response.ok && /^text\/html(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "");
}

export const previewHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
