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

type Source = { owner: string; name: string; commit: string; entry: string };
type PreviewTarget = ({ origin: string; repository?: string } | { source: Source }) & { description?: string };
type Preview = PreviewTarget & { expiresAt: number };

const sourceEntry = /^src\/main\.(tsx|jsx|ts|js)$/;

function supportedSource(source: unknown): Source | null {
  if (!source || typeof source !== "object") return null;
  const item = source as Partial<Source>;
  if (typeof item.owner !== "string" || typeof item.name !== "string" ||
      typeof item.commit !== "string" || typeof item.entry !== "string") return null;
  const repo = repositoryFromUrl(`https://github.com/${item.owner}/${item.name}`);
  if (!repo || repo.owner !== item.owner || repo.name !== item.name ||
      !/^[a-f0-9]{40}$/.test(item.commit) || !sourceEntry.test(item.entry)) return null;
  return { ...repo, commit: item.commit, entry: item.entry };
}

const encoder = new TextEncoder();

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decode(text: string) {
  return Uint8Array.from(atob(text.replaceAll("-", "+").replaceAll("_", "/")), char => char.charCodeAt(0));
}

async function previewKey(secret: string) {
  const raw = await crypto.subtle.digest("SHA-256", encoder.encode(`repoplay preview v2:${secret}`));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function createPreviewToken(target: string | PreviewTarget, now: number, secret: string, userId: string) {
  const expiresAt = now + PREVIEW_DURATION_MS;
  const preview = typeof target === "string" ? { origin: target } : target;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const body = encoder.encode(JSON.stringify({ ...preview, expiresAt }));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(userId) }, await previewKey(secret), body,
  );
  return { token: encode(iv) + "." + encode(new Uint8Array(encrypted)), expiresAt };
}

export async function readPreviewToken(token: string, secret: string, userId: string): Promise<Preview | null> {
  if (token.length > 1024 || !/^[\w-]{16}\.[\w-]+$/.test(token)) return null;
  const [nonce, body] = token.split(".");
  try {
    const bytes = decode(body);
    if (encode(bytes) !== body) return null;
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: decode(nonce), additionalData: encoder.encode(userId) }, await previewKey(secret), bytes,
    );
    const item = JSON.parse(new TextDecoder().decode(decrypted));
    const origin = supportedHomepage(item.origin);
    if (!Number.isSafeInteger(item.expiresAt)) return null;
    const description = typeof item.description === "string" ? item.description.slice(0, 140) : undefined;
    if (origin) {
      const repo = typeof item.repository === "string" && repositoryFromUrl(item.repository);
      return { origin, description, expiresAt: item.expiresAt, repository: repo ? `https://github.com/${repo.owner}/${repo.name}` : undefined };
    }
    const source = supportedSource(item.source);
    return source ? { source, description, expiresAt: item.expiresAt } : null;
  } catch {
    return null;
  }
}

export function fetchHomepage(origin: string) {
  return fetch(origin + "/", {
    headers: { "Cache-Control": "no-cache" },
    next: { revalidate: 0 },
    redirect: "manual",
    signal: AbortSignal.timeout(6000),
  });
}

export function isHtml(response: Response) {
  return response.ok && /^text\/html(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "");
}

export async function findSourcePreview(owner: string, name: string): Promise<Source | null> {
  const response = await fetch(`https://github.com/${owner}/${name}.git/info/refs?service=git-upload-pack`, {
    headers: { Accept: "application/x-git-upload-pack-advertisement" },
    redirect: "manual",
    signal: AbortSignal.timeout(6000),
    next: { revalidate: 60 },
  });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("application/x-git-upload-pack-advertisement")) {
    await response.body?.cancel();
    throw new Error("GitHub could not advertise the repository's public HEAD");
  }
  const reader = response.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let advertisement = "";
  let sha: string | undefined;
  try {
    while (!sha && advertisement.length < 8192) {
      const { value, done } = await reader.read();
      if (done) break;
      advertisement += decoder.decode(value.subarray(0, 8192 - advertisement.length), { stream: true });
      sha = /(?:^|\n)(?:0000)?[a-f0-9]{4}([a-f0-9]{40}) HEAD(?:\0|\n)/.exec(advertisement)?.[1];
    }
  } finally {
    await reader.cancel();
  }
  if (!sha) return null;
  const base = `https://raw.githubusercontent.com/${owner}/${name}/${sha}/`;
  const manifest = await fetch(base + "package.json", { redirect: "manual", signal: AbortSignal.timeout(6000) });
  if (!manifest.ok) return null;
  const packageText = await manifest.text();
  if (packageText.length > 16000) return null;
  const pkg = JSON.parse(packageText);
  if (!pkg?.dependencies?.react || !(pkg?.devDependencies?.vite || pkg?.dependencies?.vite)) return null;
  const entries = ["tsx", "jsx", "ts", "js"].map(extension => `src/main.${extension}`);
  const statuses = await Promise.all(entries.map(entry => fetch(base + entry, {
    method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(6000),
  })));
  const index = statuses.findIndex(result => result.ok);
  return index < 0 ? null : supportedSource({ owner, name, commit: sha, entry: entries[index] });
}

export const previewHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
