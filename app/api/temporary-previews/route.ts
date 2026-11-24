import { createPreviewToken, fetchHomepage, findSourcePreview, isHtml, previewHeaders, repositoryFromUrl, supportedHomepage } from "../../../lib/temporary-preview";
import { authContext, type AuthEnv } from "../../../lib/repoplay-auth";

export async function POST(request: Request) {
  return authenticatedCreation(request, process.env);
}

async function authenticatedCreation(request: Request, env: AuthEnv & { PREVIEW_SIGNING_SECRET?: string }) {
  const auth = authContext(request, env);
  if (!auth.client) return Response.json({ error: "Google sign-in is awaiting configuration." }, { status: 503, headers: previewHeaders });
  if (request.headers.get("origin") !== auth.origin) return new Response("Forbidden.", { status: 403, headers: previewHeaders });
  const userId = await auth.userId();
  const response = userId
    ? await createTemporaryPreview(request, env.PREVIEW_SIGNING_SECRET, userId)
    : Response.json({ error: "Sign in with Google to create a preview." }, { status: 401, headers: previewHeaders });
  return auth.apply(response);
}

async function createTemporaryPreview(request: Request, secret: string | undefined, userId: string) {
  const reply = (body: object, status: number) => Response.json(body, { status, headers: previewHeaders });
  if (!secret || new TextEncoder().encode(secret).length < 32) return reply({ error: "Temporary previews are disabled on this installation." }, 503);
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
        stage = "preview signing";
        const repository = `https://github.com/${repo.owner}/${repo.name}`;
        const { token, expiresAt } = await createPreviewToken({ origin, repository, description }, Date.now(), secret, userId);
        return reply({ path: `/temporary/${token}`, expiresAt }, 201);
      }
    }

    stage = "GitHub";
    const source = await findSourcePreview(repo.owner, repo.name, frontendOnly);
    if (!source && frontendOnly) return reply({ error: "No compatible static, Vite React, or Create React App frontend was found." }, 422);
    if (!source) return reply({ error: "Source previews support static sites with a root index.html and compatible Vite React and Create React App projects." }, 422);
    stage = "preview signing";
    const { token, expiresAt } = await createPreviewToken({ source, description }, Date.now(), secret, userId);
    return reply({ path: `/temporary/${token}`, expiresAt }, 201);
  } catch (error) {
    console.error("RepoPlay preview failed", stage, error instanceof Error ? error.name : "Unknown error");
    return reply({ error: stage === "preview signing" ? "RepoPlay could not create the preview link." : `RepoPlay could not reach ${stage}. Try again shortly.` }, 502);
  }
}
