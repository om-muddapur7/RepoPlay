# RepoPlay

RepoPlay lets developers publish public GitHub projects alongside working, hosted demos. Visitors can browse, filter, and try projects without an account.

## MVP scope

- Visitors search the gallery by title, description, or technology, filter by category, open project and developer pages, and launch demos or visit the source repository.
- Developers sign in with GitHub, import a public repository, add an HTTPS demo URL and optional thumbnail, and publish, edit, or unpublish their listing.
- Owners see daily demo launches. A launch counts an explicit viewer or external-link click. It does not measure whether the third-party application loaded or how long someone used it.
- Later releases can add bookmarks, collections, trending, screenshots, teams, monetization, and automatic deployment.

## Architecture

Use one Next.js App Router application with TypeScript. Tailwind supplies the styling foundation. Add individual shadcn/ui controls and Motion when an interaction needs them. Server components render public pages and route handlers handle OAuth callbacks, GitHub imports, and analytics.

RepoPlay uses Clerk for authentication, private gallery metadata, and billing. The redesigned app needs a Next.js runtime for Clerk session middleware and server routes. The previous Sites Worker packaging script targets the earlier Supabase release.

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

Paste a public GitHub repository URL into the preview form. RepoPlay embeds a working public Vercel deployment from the repository’s Website field when available. Source previews also support static sites with a root index.html, relative CSS, JavaScript and image paths, and links between HTML pages. For an unhosted React + Vite app, it pins the default branch to a commit and compiles the source inside a sandboxed browser frame. Source previews support Vite's `src/main` convention, a standard `root` element, local imports, CSS, common image formats, React, and React Router. React Router uses in-memory navigation in this mode. RepoPlay does not execute install scripts or Vite config and does not provide backend services or environment secrets.

Select **Frontend demo** to build directly from source and check the usual frontend folders (`frontend`, `client`, and `web`) as well as the repository root. AI Expense Tracker uses its nested React frontend with sample transactions and simulated insights. Edits in that demo are kept only in memory during the preview.

Preview creation and viewing require a Clerk session. Preview links are tied to the signed-in Clerk user and expire after ten minutes. Source previews are saved after rendering, and embedded demos are saved after the user confirms visibility.

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

Open http://localhost:3000. Configure the Clerk keys below before starting. Use `npm.cmd run check` for TypeScript and production build checks.

## Setup (Clerk auth + billing)

1. Create an application at https://dashboard.clerk.com and enable the sign-in methods you want (Google, GitHub, email).
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `PREVIEW_SIGNING_SECRET` (32+ chars).
3. In Clerk, open **Billing**, enable it, connect Stripe, and create **user** plans with the slugs `basic` ($5/month) and `premium` ($12/month). Change `PAID_PLAN_SLUGS` if you use different slugs.
4. `npm install && npm run dev`.

Free users get 2 previews (enforced server-side); users on a paid plan are unlimited. Gallery data and usage counters live in each user's Clerk private metadata. Existing Supabase galleries need an account migration before switching a live installation.
