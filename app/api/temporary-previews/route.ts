import { createPreviewToken, fetchHomepage, isHtml, previewHeaders, repositoryFromUrl, supportedHomepage } from "../../../lib/temporary-preview";

export async function POST(request: Request) {
  return createTemporaryPreview(request, process.env.PREVIEW_SIGNING_SECRET);
}

async function createTemporaryPreview(request: Request, secret: string | undefined) {
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

  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;
    const github = await fetch(url, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "RepoPlay" },
      redirect: "error",
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 60 },
    });
    if (github.status === 404) return reply({ error: "GitHub could not find that public repository." }, 404);
    if (!github.ok) return reply({ error: "GitHub could not check the repository. Try again shortly." }, 502);
    const metadata = await github.json();
    const origin = supportedHomepage(metadata.homepage);
    if (!origin || metadata.private) {
      return reply({ error: "Set the public repository’s GitHub Website field to a working Vercel deployment. RepoPlay uses the deployed build." }, 422);
    }

    const homepage = await fetchHomepage(origin);
    await homepage.body?.cancel();
    if (!isHtml(homepage)) return reply({ error: "The Vercel homepage did not return a working HTML page." }, 422);
    const { token, expiresAt } = await createPreviewToken(origin, Date.now(), secret);
    return reply({ path: `/temporary/${token}`, expiresAt }, 201);
  } catch {
    return reply({ error: "RepoPlay could not reach GitHub or the demo host. Try again shortly." }, 502);
  }
}
