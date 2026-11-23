import { authContext, type AuthEnv } from "../../../lib/repoplay-auth";
import { galleryEntries } from "../../../lib/gallery-history";
import { repositoryFromUrl } from "../../../lib/temporary-preview";

async function accountDetails(request: Request, env: AuthEnv) {
  const auth = authContext(request, env);
  const user = await auth.user();
  if (!user) return auth.apply(Response.json({ account: null, projects: [] }));
  const data = user.user_metadata;
  const name = typeof data.full_name === "string" ? data.full_name.slice(0, 100) : "Your account";
  let avatar = "";
  try {
    const candidate = new URL(data.avatar_url ?? data.picture);
    if (candidate.origin === "https://lh3.googleusercontent.com") avatar = candidate.href;
  } catch {
    // Accounts without a Google profile photo use initials.
  }
  return auth.apply(Response.json({ account: { name, avatar }, projects: galleryEntries(data.repoplay_rendered) }));
}

export function GET(request: Request) {
  return accountDetails(request, process.env);
}

async function removeGalleryProject(request: Request, env: AuthEnv) {
  const auth = authContext(request, env);
  if (!auth.client || auth.origin !== request.headers.get("origin")) {
    return auth.apply(new Response(null, { status: 403 }));
  }
  const user = await auth.user();
  if (!user) return auth.apply(new Response(null, { status: 401 }));
  const length = Number(request.headers.get("content-length"));
  if (length <= 0 || length > 1024) return auth.apply(new Response(null, { status: 400 }));
  const payload = await request.json().catch(() => null);
  const repo = typeof payload?.repository === "string" && repositoryFromUrl(payload.repository);
  if (!repo) return auth.apply(new Response(null, { status: 400 }));
  const repository = `https://github.com/${repo.owner}/${repo.name}`.toLowerCase();
  const projects = galleryEntries(user.user_metadata.repoplay_rendered);
  const remaining = projects.filter(project => project.repository.toLowerCase() !== repository);
  if (remaining.length === projects.length) return auth.apply(new Response(null, { status: 204 }));
  const { error } = await auth.client.auth.updateUser({ data: { repoplay_rendered: remaining } });
  return auth.apply(new Response(null, { status: error ? 503 : 204 }));
}

export function DELETE(request: Request) {
  return removeGalleryProject(request, process.env);
}
