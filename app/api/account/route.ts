import { authContext, type AuthEnv } from "../../../lib/repoplay-auth";
import { galleryEntries } from "../../../lib/gallery-history";

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
