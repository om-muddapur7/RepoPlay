import { createServerClient } from "@supabase/ssr";
import { parseCookie, stringifySetCookie } from "cookie";

export type AuthEnv = {
  [key: string]: string | undefined;
  REPOPLAY_ORIGIN?: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
};

function appOrigin(env: AuthEnv) {
  if (!env.REPOPLAY_ORIGIN) return null;
  try {
    const url = new URL(env.REPOPLAY_ORIGIN);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return url.origin === env.REPOPLAY_ORIGIN && (url.protocol === "https:" || (loopback && url.protocol === "http:"))
      ? url.origin : null;
  } catch {
    return null;
  }
}

export function authContext(request: Request, env: AuthEnv) {
  const origin = appOrigin(env);
  const pending: string[] = [];
  const jar = parseCookie(request.headers.get("cookie") ?? "");
  const client = origin && env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY
    ? createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
        cookies: {
          getAll: () => Object.entries(jar).flatMap(([name, value]) => value === undefined ? [] : [{ name, value }]),
          setAll: (cookies) => {
            for (const { name, value, options } of cookies) {
              jar[name] = value;
              pending.push(stringifySetCookie({
                ...options, name, value, path: "/", httpOnly: true, secure: origin.startsWith("https:"), sameSite: "lax",
              }));
            }
          },
        },
      })
    : null;

  return {
    origin,
    client,
    apply(response: Response) {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "private, no-store");
      for (const cookie of pending) headers.append("Set-Cookie", cookie);
      return new Response(response.body, { status: response.status, headers });
    },
    async user() {
      if (!client) return null;
      const { data, error } = await client.auth.getUser();
      return error ? null : data.user;
    },
    async userId() {
      return (await this.user())?.id ?? null;
    },
  };
}

export function signInPage(request: Request, env: AuthEnv) {
  const { client } = authContext(request, env);
  const url = new URL(request.url);
  const failed = url.searchParams.get("error") === "oauth";
  const signingOut = url.searchParams.get("mode") === "signout";
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sign in · RepoPlay</title>
  <style>:root{color-scheme:dark;--bg:#080b13;--glow:#18294c;--panel:#15213cd6;--line:#2a3d61;--text:#eef3fb;--muted:#a4b2cb;--accent:#9fc0ff;--ink:#0a1939}:root[data-theme=light]{color-scheme:light;--bg:#edf2fb;--glow:#cfdbf4;--panel:#ffffffe0;--line:#c6d2e8;--text:#142441;--muted:#485d7e;--accent:#284f9a;--ink:white}body{margin:0;display:grid;place-items:center;min-height:100dvh;background:radial-gradient(ellipse at 80% 0%,var(--glow),transparent 58%),var(--bg);color:var(--text);font:16px system-ui;padding:20px;box-sizing:border-box}main{width:min(100%,440px);box-sizing:border-box;padding:32px;border:1px solid var(--line);border-radius:16px;background:var(--panel);backdrop-filter:blur(18px)}nav{display:flex;justify-content:space-between;align-items:center}a{color:var(--accent)}h1{margin-block:23px 8px;font:500 clamp(2rem,7vw,3rem)/1 Georgia,serif;letter-spacing:-.04em}p{color:var(--muted);line-height:1.55}button{font:inherit;font-weight:700;background:var(--accent);color:var(--ink);border:0;border-radius:8px;padding:12px 16px;cursor:pointer}button:disabled{opacity:.6;cursor:default}#theme-toggle{color:var(--text);background:transparent;border:1px solid var(--line);font-size:1.15rem;line-height:1;width:42px;height:42px;padding:0}</style><script defer src="/workspace.js"></script></head>
  <body><main><nav><a href="/">RepoPlay</a><button id="theme-toggle" type="button" aria-label="Switch to light mode" title="Switch to light mode"><span aria-hidden="true">☀︎</span></button></nav><h1>${signingOut ? "Sign out of RepoPlay" : "Sign in to RepoPlay"}</h1>
  <p>${signingOut ? "End your RepoPlay session for this browser." : "Use your Google account to create and open your private previews."}</p>
  ${failed ? '<p role="alert">Google sign-in could not be completed. Please try again.</p>' : ""}
  ${!client ? '<p role="status">Google sign-in is awaiting configuration.</p>' : ""}
  <form method="post" action="${signingOut ? "/auth/signout" : "/auth/google"}"><button ${client ? "" : "disabled"}>${signingOut ? "Sign out" : "Continue with Google"}</button></form>
  </main></body></html>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; form-action 'self' https:; frame-ancestors 'none'; base-uri 'none'",
      "Referrer-Policy": "same-origin",
    },
  });
}

export async function handleAuth(request: Request, action: string, env: AuthEnv) {
  const auth = authContext(request, env);
  const { client, origin } = auth;
  if (!client || !origin) return Response.json({ error: "Google sign-in is awaiting configuration." }, { status: 503 });
  const redirect = (target: string) => auth.apply(new Response(null, {
    status: 303, headers: { Location: target, "Referrer-Policy": "no-referrer" },
  }));
  const failure = origin + "/signin?error=oauth";

  if (action === "callback" && request.method === "GET") {
    const code = new URL(request.url).searchParams.get("code");
    if (!code) return redirect(failure);
    const { error } = await client.auth.exchangeCodeForSession(code);
    return redirect(error ? failure : origin + "/");
  }

  if ((action === "google" || action === "signout") && request.method === "POST") {
    if (request.headers.get("origin") !== origin) return new Response("Forbidden.", { status: 403 });
    if (action === "signout") {
      const { error } = await client.auth.signOut({ scope: "local" });
      return redirect(error ? failure : origin + "/signin");
    }
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: origin + "/auth/callback", skipBrowserRedirect: true },
    });
    return redirect(error || !data.url ? failure : data.url);
  }

  return new Response("Not found.", { status: 404 });
}
