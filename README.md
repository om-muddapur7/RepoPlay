# RepoPlay

RepoPlay lets developers publish public GitHub projects alongside working, hosted demos. Visitors can browse, filter, and try projects without an account.

## MVP scope

- Visitors search the gallery by title, description, or technology, filter by category, open project and developer pages, and launch demos or visit the source repository.
- Developers sign in with GitHub, import a public repository, add an HTTPS demo URL and optional thumbnail, and publish, edit, or unpublish their listing.
- Owners see daily demo launches. A launch counts an explicit viewer or external-link click. It does not measure whether the third-party application loaded or how long someone used it.
- Later releases can add bookmarks, collections, trending, screenshots, teams, monetization, and automatic deployment.

## Architecture

Use one Next.js App Router application with TypeScript. Tailwind supplies the styling foundation. Add individual shadcn/ui controls and Motion when an interaction needs them. Server components render public pages and route handlers handle OAuth callbacks, GitHub imports, and analytics.

Use Supabase Auth with the GitHub provider and PKCE. This replaces Auth.js and lets Postgres enforce ownership through row-level security using the same session identity. Create a public profile from verified GitHub identity data on first login. Use GitHub's stable numeric user and repository IDs as identifiers and snapshot metadata on import. Use the public repository API, cache metadata briefly, and handle rate limits without storing the GitHub OAuth token in project data.

Use Cloudflare Workers Free on a workers.dev subdomain and Supabase Free. Check Next.js compatibility with the Cloudflare adapter before deployment and verify OAuth, database requests, and CPU usage in the Workers preview. Cloudflare lists 100,000 Worker requests per day and 10 ms CPU per invocation on Free. Supabase lists 500 MB of database space and pauses free projects after a week of inactivity.

Accept HTTPS demo links without credentials. Do not proxy submitted sites or execute repositories. The viewer should load a cross-origin iframe only after a user requests it, grant scripts with a minimal sandbox, and avoid enabling top navigation, popups, or same-origin access by default. Always show a direct external link because some hosts block framing or require capabilities the sandbox restricts. Keep analytics writes server-side with rate limits and retry-safe event IDs.

## Visual design

Use a deep navy canvas, high-contrast text, and mint accents for actions. Lead with a short introduction and the searchable discovery grid. Give each card a distinct application preview, technology, and category. Use a single-column layout on small screens. The details view presents context, source, and demo launch together. Keep forms and dashboard actions keyboard accessible.

## Repository structure

```text
app/                         Public pages and application entry points
  projects/[slug]/           Project details
  developers/[handle]/       Public profile (planned)
  dashboard/                 Publishing and analytics (planned)
  auth/callback/             GitHub OAuth callback (planned)
  api/                       GitHub import and launch tracking (planned)
components/                  Gallery and shared interface components
lib/                         Catalog, then server integrations and validation
supabase/migrations/         Versioned Postgres schema
.github/workflows/           CI build and type checks (planned)
```

The initial schema defines profiles, categories, projects, and demo launch events. Projects have a composite owner/repository uniqueness rule, an indexed search document, and owner-only draft access. The analytics table records idempotent launch events with a project/time index for daily counts.

## Implementation milestones

1. Bootstrap Next.js and build the responsive gallery and detail routes against clearly labeled example projects.
2. Apply the database migration, wire up GitHub OAuth, and replace the sample catalog with published database records. Verify private drafts and cross-account access with two accounts.
3. Add GitHub import, owner dashboard, and publish/edit/delete flows. Verify repository metadata, validation, and authorization on the server.
4. Add developer pages, the interactive sandboxed viewer, and owner analytics. Test an embeddable demo, a framing-blocked demo, and retry-safe analytics.
5. Add CI, check accessibility and runtime cost, exercise OAuth on the Workers preview, and deploy on the free plans.

## Run locally

### Ten-minute repository previews

Paste a public GitHub repository URL into the preview form. RepoPlay embeds a working public Vercel deployment from the repository’s Website field when available. For an unhosted React + Vite app, it pins the default branch to a commit and compiles the source inside a sandboxed browser frame. Source previews support Vite's `src/main` convention, a standard `root` element, local imports, CSS, common image formats, React, and React Router. React Router uses in-memory navigation in this mode. RepoPlay does not execute install scripts or Vite config and does not provide backend services or environment secrets.

Preview creation and viewing require a Google session. RepoPlay encrypts each preview link with authenticated encryption tied to the verified Supabase user ID. Signed-out visitors and other accounts receive HTTP 404. The owner gets HTTP 410 after ten minutes, and the live viewer removes its iframe. RepoPlay stores no deployment files or database row to clean up. GitHub source files remain available independently.

### Google sign-in

The workspace displays the signed-in Google account's profile photo or initials. The private gallery keeps up to 100 distinct recently rendered repositories in that user's Supabase Auth metadata. Source previews are added after rendering content. Embedded Vercel previews are added after the user confirms the site is visible.

1. In Google Cloud, configure the consent screen and create a web OAuth client. Register the callback URL shown in the Supabase Google provider settings as the Google client's authorized redirect URI.
2. In Supabase Auth, enable Google and enter that client ID and secret. Add the exact RepoPlay URL plus `/auth/callback` to the Supabase Redirect URLs allowlist. For local development, use `http://localhost:3000/auth/callback`.
3. Copy `.env.example` to `.env.local` and fill in `REPOPLAY_ORIGIN`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. For Sites, configure the same variables in its environment settings with the deployed site origin. Keep the Google client secret in Supabase.
4. Open `/signin` and select **Continue with Google**. The OAuth callback exchanges the PKCE code for a session in HTTP-only cookies. The sample gallery is still available without a RepoPlay session where hosting access permits it.

To enable the feature, set `PREVIEW_SIGNING_SECRET` to a randomly generated server-side secret of at least 32 bytes. In PowerShell, run the following from the project directory before starting Next.js.

```powershell
$env:PREVIEW_SIGNING_SECRET = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Set the same secret through your hosting provider's secret manager for a deployed installation. Apply an edge rate limit to `POST /api/temporary-previews` before opening the service to public traffic. GitHub's public API also has request quotas.

Requires Node.js 20.9 or later. On Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. The first milestone runs without GitHub or Supabase credentials. Use `npm.cmd run check` for TypeScript and production build checks.
