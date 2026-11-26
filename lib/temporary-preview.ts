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

type Source = { owner: string; name: string; commit: string; entry: string; directory?: string; frontendOnly?: true };
type PreviewTarget = ({ origin: string; repository?: string } | { source: Source }) & { description?: string };
type Preview = PreviewTarget & { expiresAt: number | null };

const sourceEntry = /^src\/(?:main|index)\.(tsx|jsx|ts|js)$/;

function supportedSource(source: unknown): Source | null {
  if (!source || typeof source !== "object") return null;
  const item = source as Partial<Source>;
  if (typeof item.owner !== "string" || typeof item.name !== "string" ||
      typeof item.commit !== "string" || typeof item.entry !== "string") return null;
  const repo = repositoryFromUrl(`https://github.com/${item.owner}/${item.name}`);
  if (!repo || repo.owner !== item.owner || repo.name !== item.name ||
      !/^[a-f0-9]{40}$/.test(item.commit) || (item.entry !== "index.html" && !sourceEntry.test(item.entry))) return null;
  if (item.directory !== undefined && (typeof item.directory !== "string" || !/^[\w-]{1,70}(?:\/[\w-]{1,70})?$/.test(item.directory))) return null;
  return { ...repo, commit: item.commit, entry: item.entry, directory: item.directory, frontendOnly: item.frontendOnly === true ? true : undefined };
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

export async function createPreviewToken(target: string | PreviewTarget, now: number, secret: string, userId: string, untimed = false) {
  const expiresAt = untimed ? null : now + PREVIEW_DURATION_MS;
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
    if (item.expiresAt !== null && !Number.isSafeInteger(item.expiresAt)) return null;
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

export function isExpenseTrackerDemo(source: Source) {
  return source.frontendOnly && source.owner.toLowerCase() === "om-muddapur7" && source.name.toLowerCase() === "ai-expense-tracker" && source.directory === "frontend/expense_tracker";
}

export async function findSourcePreview(owner: string, name: string, frontendOnly = false): Promise<Source | null> {
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
  const directories = frontendOnly ? ["frontend", "client", "web", ""] : [""];
  if (isExpenseTrackerDemo({ owner, name, commit: sha, directory: "frontend/expense_tracker", frontendOnly: frontendOnly ? true : undefined, entry: "src/main.jsx" })) {
    directories.unshift("frontend/expense_tracker");
  }
  const candidates = await Promise.allSettled(directories.map(async directory => {
    const folder = base + (directory ? directory + "/" : "");
    const source = { owner, name, commit: sha, directory: directory || undefined, frontendOnly: frontendOnly ? true : undefined };
    const manifest = await fetch(folder + "package.json", { redirect: "manual", signal: AbortSignal.timeout(6000) });
    if (!manifest.ok && manifest.status !== 404) throw new Error("GitHub could not read the package manifest");
    const packageText = manifest.ok ? await manifest.text() : "{}";
    if (packageText.length > 16000) return null;
    const pkg = JSON.parse(packageText);
    const vite = pkg?.devDependencies?.vite || pkg?.dependencies?.vite;
    const reactScripts = pkg?.dependencies?.["react-scripts"] || pkg?.devDependencies?.["react-scripts"];
    if (!vite && !reactScripts && !pkg?.scripts?.build && !pkg?.dependencies?.react && !pkg?.devDependencies?.react) {
      const index = await fetch(folder + "index.html", {
        method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(6000),
      });
      return index.ok ? supportedSource({ ...source, entry: "index.html" }) : null;
    }
    if ((!vite && !reactScripts) || !pkg?.dependencies?.react) return null;
    const entries = ["tsx", "jsx", "ts", "js"].map(extension => `src/${vite ? "main" : "index"}.${extension}`);
    const statuses = await Promise.all(entries.map(entry => fetch(folder + entry, {
      method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(6000),
    })));
    const index = statuses.findIndex(result => result.ok);
    return index < 0 ? null : supportedSource({ ...source, entry: entries[index] });
  }));
  for (const result of candidates) {
    if (result.status === "fulfilled" && result.value) return result.value;
  }
  const failed = candidates.find(result => result.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
  return null;
}

export const previewHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
