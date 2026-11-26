import { createPreviewToken, fetchHomepage, findSourcePreview, isHtml, previewHeaders, repositoryFromUrl, supportedHomepage } from "../../../lib/temporary-preview";
import { planNames, previewLimits } from "../../../lib/plans";
import { readPrivate, session, writePrivate } from "../../../lib/account";

export async function POST(request: Request) {
  const secret = process.env.PREVIEW_SIGNING_SECRET;
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new Response("Forbidden.", { status: 403, headers: previewHeaders });
  const current = await session();
  if (!current) return Response.json({ error: "Sign in to create a preview." }, { status: 401, headers: previewHeaders });
  if (/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "") &&
      Number(request.headers.get("content-length")) > 0 &&
      Number(request.headers.get("content-length")) <= 2048) {
    const payload = await request.clone().json().catch(() => null);
    if (payload?.mode === "frontend" && !current.paid) {
      return Response.json({ error: "Frontend demo mode is included in Basic and Premium.", upgrade: true }, { status: 403, headers: previewHeaders });
    }
    if (payload?.action === "inspect") {
      if (payload.mode === "frontend" && current.tier !== "premium") {
        return Response.json({ error: "Frontend compatibility checks are included in Premium.", upgrade: true }, { status: 403, headers: previewHeaders });
      }
      return createTemporaryPreview(request, secret, current.userId, true);
    }
  }
  let created = 0;
  const limit = previewLimits[current.tier];
  if (limit !== null) {
    const usage = await readPrivate(current.userId);
    created = current.tier === "basic" ? usage.basicCreated : usage.created;
    if (created >= limit) {
      return Response.json({ error: `You have used your ${limit} ${planNames[current.tier]} previews. Upgrade to keep creating.`, upgrade: true }, { status: 402, headers: previewHeaders });
    }
  }
  const response = await createTemporaryPreview(request, secret, current.userId, false, current.tier === "premium");
  if (response.status === 201 && limit !== null) {
    await writePrivate(current.userId, current.tier === "basic"
      ? { repoplay_basic_created: created + 1 }
      : { repoplay_created: created + 1 });
  }
  return response;
}

async function createTemporaryPreview(request: Request, secret: string | undefined, userId: string, inspect = false, untimed = false) {
  const reply = (body: object, status: number) => Response.json(body, { status, headers: previewHeaders });
  if (!inspect && (!secret || new TextEncoder().encode(secret).length < 32)) return reply({ error: "Preview creation needs a valid PREVIEW_SIGNING_SECRET on the server." }, 503);
  if (request.headers.get("sec-fetch-site") === "cross-site" ||
    !/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return reply({ error: "Submit the repository URL from RepoPlay." }, 400);
  }
  const length = Number(request.headers.get("content-length"));
  if (length <= 0 || length > 2048) return reply({ error: "Submit a single GitHub repository URL." }, 400);
  const payload = await request.json().catch(() => null);
  const repo = typeof payload?.repository === "string" && repositoryFromUrl(payload.repository.trim());
  if (!repo) return reply({ error: "Enter a public GitHub repository URL such as https://github.com/owner/repo." }, 400);

  const frontendOnly = payload?.mode === "frontend";
  let stage = "GitHub";
  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;
    const github = await fetch(url, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "RepoPlay" },
      redirect: "manual",
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 60 },
    }).catch(() => null);
    if (github?.status === 404) return reply({ error: "GitHub could not find that public repository." }, 404);
    const metadata = github?.ok ? await github.json() : null;
    if (!github?.ok) await github?.body?.cancel();
    const description = typeof metadata?.description === "string" ? metadata.description.trim().slice(0, 140) : undefined;
    const origin = supportedHomepage(metadata?.homepage);
    if (metadata?.private) return reply({ error: "Use a public GitHub repository." }, 422);
    if (origin && !frontendOnly) {
      stage = "Vercel";
      const homepage = await fetchHomepage(origin).catch(() => null);
      await homepage?.body?.cancel();
      if (homepage && isHtml(homepage)) {
        if (inspect) return reply({ report: "Existing Vercel deployment · HTML reachable" }, 200);
        stage = "preview signing";
        const repository = `https://github.com/${repo.owner}/${repo.name}`;
        const { token, expiresAt } = await createPreviewToken({ origin, repository, description }, Date.now(), secret!, userId, untimed);
        return reply({ path: `/temporary/${token}`, expiresAt }, 201);
      }
    }

    stage = "GitHub";
    const source = await findSourcePreview(repo.owner, repo.name, frontendOnly);
    if (!source && frontendOnly) return reply({ error: "No compatible static, Vite React, or Create React App frontend was found." }, 422);
    if (!source) return reply({ error: "Source previews support static sites with a root index.html and compatible Vite React and Create React App projects." }, 422);
    if (inspect) {
      const framework = source.entry === "index.html" ? "Static HTML"
        : source.entry.startsWith("src/index.") ? "React · Create React App entry"
        : "React · Vite-style entry";
      return reply({ report: `${framework} · Folder: ${source.directory ?? "/"} · Entry: ${source.entry}. Imports and runtime behavior are checked when the preview runs.` }, 200);
    }
    stage = "preview signing";
    const { token, expiresAt } = await createPreviewToken({ source, description }, Date.now(), secret!, userId, untimed);
    return reply({ path: `/temporary/${token}`, expiresAt }, 201);
  } catch (error) {
    console.error("RepoPlay preview failed", stage, error instanceof Error ? error.name : "Unknown error");
    return reply({ error: stage === "preview signing" ? "RepoPlay could not create the preview link." : `RepoPlay could not reach ${stage}. Try again shortly.` }, 502);
  }
}
