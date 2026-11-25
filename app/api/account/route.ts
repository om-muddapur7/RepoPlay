import { repositoryFromUrl } from "../../../lib/temporary-preview";
import { FREE_PREVIEW_LIMIT, readPrivate, session, writePrivate } from "../../../lib/account";

const noStore = { "Cache-Control": "private, no-store" };

export async function GET() {
  const current = await session();
  if (!current) return Response.json({ account: null, projects: [] }, { headers: noStore });
  const { user, projects, created } = await readPrivate(current.userId);
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").slice(0, 100) || user.username || "Your account";
  return Response.json({
    account: { name, avatar: user.imageUrl, paid: current.paid, used: created, limit: current.paid ? null : FREE_PREVIEW_LIMIT },
    projects,
  }, { headers: noStore });
}

export async function DELETE(request: Request) {
  const current = await session();
  if (!current) return new Response(null, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const length = Number(request.headers.get("content-length"));
  if (length <= 0 || length > 1024) return new Response(null, { status: 400 });
  const payload = await request.json().catch(() => null);
  const repo = typeof payload?.repository === "string" && repositoryFromUrl(payload.repository);
  if (!repo) return new Response(null, { status: 400 });
  const repository = `https://github.com/${repo.owner}/${repo.name}`.toLowerCase();
  const { projects } = await readPrivate(current.userId);
  const remaining = projects.filter(project => project.repository.toLowerCase() !== repository);
  if (remaining.length !== projects.length) await writePrivate(current.userId, { repoplay_rendered: remaining });
  return new Response(null, { status: 204 });
}
