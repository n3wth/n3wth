# Workspace deployment

Directory update (October 2026): current source paths are `apps/ui` and `apps/r3`. Older paths below describe historical snapshots; npm workspace and deployed preview names remain unchanged.

## Cloudflare builds and configuration

Cloudflare Workers serves the public sites. Use Node 24 and npm 11.19.1,
then run `npm ci` at the repository root.

```bash
# Build all Workers and their assets. Shared packages build once.
npm run build:cloudflare

# Select one site, or repeat --workspace to select several.
npm run build:cloudflare -- --workspace @n3wth/garden

# Inspect dependency order without building.
npm run build:cloudflare -- --workspace @n3wth/garden --list

# Check packaging after building; this does not deploy.
npm exec -- wrangler deploy --config apps/garden/wrangler.jsonc --dry-run
```

The command uses the same workspace graph as `npm run build`. Portfolio uses
Vite. Garden builds a redirect Worker from portfolio's published-note data.
Skills uses Vinext with the Cloudflare Vite plugin. The retired r3 and UI sites
use plain redirect Workers, without React builds. Do not run a separate shared-package prebuild.

### Vinext Workers

Skills keeps its App Router routes and `next/*` imports. `next` remains
installed for types and library peer dependencies; Vite builds and runs the app.
The root Vite 8 pin ensures hoisted RSC and Cloudflare plugins detect the same
version as these apps. Workspace Vite and React plugins use the same versions
to avoid incompatible hoisted plugin types and runtime detection.

`npm run dev -w @n3wth/skills` runs locally in workerd. After building, use
`npm run start -w @n3wth/skills` to test the production Worker. Package and deploy
the generated `apps/skills/dist/server/wrangler.json`, not the source config.
The retired r3 and UI domains are served by Cloudflare redirect rules. Their
local Worker fixtures use source `wrangler.jsonc` files for route tests and remain
excluded from production deployments. Do not create replacement production
Workers for these domains. r3's separate search Worker and its source corpus
remain because they have independent consumers.

The source `wrangler.jsonc` owns Worker identity, domains and bindings. Vite
generates executable and asset paths under `dist/`. Preview tooling reads that
generated config, substitutes isolated bindings and adds noindex headers. It
fails if the build is absent. Verify with:

```bash
npm run build:cloudflare -- --workspace @n3wth/skills
npm exec -- wrangler deploy --config apps/skills/dist/server/wrangler.json --dry-run
npm run test:migration -w @n3wth/skills
npm run check:metadata -- --apps skills
```

Metadata checks render public static routes in a temporary local Worker rather
than reading Next.js prerender files. Browser checks cover representative dynamic
routes, search, downloads and responsive layout. Auth and D1 tests exercise the
existing schema, token replay rejection, ownership and quotas.

This migration changes no persisted data or database schema. D1 and auth helpers
read native `cloudflare:workers` bindings. Cookies, secrets, database IDs and
public routes retain their contracts so old and new Workers can overlap. No new
cache or image service is required. Axiom runs after client hydration.

Before production cutover, verify the isolated preview including authenticated
flows with preview credentials. Record the previous Worker version, then use the
existing production workflow and verify live routes. Rollback restores that
Worker version and reverts the migration commit for subsequent builds. Retain
the database, secrets and domain bindings. A local build is not a live cutover.

### Garden consolidation cutover

Published Garden content now belongs to `apps/portfolio/content` and uses
`/thinking/<slug>`, including nested slugs. Build portfolio before Garden so its
redirect map reflects the same published content. Validate previews for both
Workers: note pages, assets, topic filters, aliases, and genuine unknown-path 404s.
Garden's homepage and world routes redirect to the portfolio homepage.

Record both production Worker version IDs before cutover. Deploy portfolio
first and verify the live reading pages and homepage groves. Then deploy Garden's
redirect Worker and verify permanent redirects on the existing domain. A local
build or preview alone is not a completed cutover. Roll back Garden to its prior
Worker version first if redirects fail; roll back portfolio only after restoring
the standalone reader. Retain the prior Worker versions and domain bindings.

Each active site's `apps/<app>/wrangler.jsonc` is the production configuration: Worker name,
custom domain, assets and resource bindings. There are no separate production
config files. Inspect the target before using Wrangler; a deploy with this config
changes production. Build and package in the same checkout and operating system.
Vinext output and generated preview configs can contain absolute paths; do not
copy them to another machine for deployment.

The Cloudflare preview workflow uses this build command, then
`scripts/cloudflare/cloudflare-preview.mjs` generates an isolated config under `.cloudflare/`.
It replaces the Worker name, domain and Skills auth origin,
requires explicit preview stateful bindings, and adds preview-only noindex behavior.
Secrets stay outside source config and are provisioned separately for each Worker.
Never deploy generated preview config to production or point a preview at the
production database.

A build or dry run does not prove live readiness. Each preview deploy now runs an
automated readiness gate. After the upload and the DNS record, the preview script
requests the target host over HTTPS through `scripts/cloudflare/cloudflare-preview-verify.mjs`.
The deploy fails unless the host resolves, the certificate validates, the page
returns HTTP 200, and the preview `X-Robots-Tag: noindex` header is present. The
gate keeps certificate validation on and retries while the Worker custom domain
and its proxied DNS record finish provisioning. Production automation, D1 setup
and rollback tracking remain separate work.

## Vercel: retired

Cloudflare serves all six public sites. Vercel is no longer a deployment
target: there is no `vercel.json` in any app, no install/ignore-command
scripts, and no CI step that depends on them. The Vercel projects garden,
kit, n3wth, r3, skills and ui still exist with their domains and deployment
history for reference, but are disconnected from the GitHub repository and
have no path back without redoing this integration from scratch.

## Project layout and migration history

Historical record of the original Vercel monorepo pilot. Vercel is retired
(see above) — `scripts/vercel-install.mjs`, `scripts/vercel-ignore.mjs` and
every app's `vercel.json` described below no longer exist in this repository.

The pilot shipped in PR #149 at 98e871cc6b20e78b772eed32d39ded5357f33772 on September 6 2026. Both projects kept their domains and built from n3wth/n3wth. Everything below in this section describes that retired pilot and is kept for reference only; do not follow these procedures.

| Project | Previous source root | Workspace root | Build |
| --- | --- | --- | --- |
| n3wth | . | apps/portfolio | cd ../.. && npm run build:portfolio |
| ui | . in n3wth/ui | apps/ui-docs in n3wth/n3wth | cd ../.. && npm run build:ui-docs |
| garden | . in n3wth/newth-garden | apps/garden | cd ../.. && npm run build:garden |
| skills | . in n3wth/skills | apps/skills | cd ../.. && npm run build:skills |
| kit | . in n3wth/kit | apps/kit | cd ../.. && npm run build:kit |
| r3 | website in n3wth/r3 | apps/r3-web | cd ../.. && npm run build:r3 |

The pilot used Node 24 and npm 11.19.1. Every app installed with `scripts/vercel-install.mjs <workspace>`, which resolved the app and the workspace packages it built from out of the same dependency graph the affected checker used, then ran a filtered incremental install for exactly those. Root-only browser and asset-generation tooling, and every other app's dependencies, stayed out of the deployment tree. It reused Vercel's restored node_modules and failed if npm changed the committed dependency resolution; extraneous installed-package inventory was discarded and the original lockfile bytes retained. CI used `npm ci`; each app's vercel.json held its commands. Projects enabled access to files outside the app root for workspace packages. The pilot preserved the project identities, domains, environment scopes and API functions. Each source switch followed a verified preview and combined workspace checks.

Every app added `--cache-ui` to its root build command. UI output was stored under `node_modules/.cache/n3wth-ui-build`, within Vercel's default dependency cache. A content key included UI sources, scripts, fonts, configuration, local environment files, Vite environment variables, root manifests and lockfile, cache/build scripts, and Node version/platform/architecture. Every cached output file was hashed before restoration; a miss or corrupt cache ran the normal UI build. Each app itself always rebuilt, including portfolio's data refresh and metadata generation. CI and default local builds did not opt into this artifact cache. A full Vercel build was forced by disabling the build cache for that deployment. See [build measurements](build-performance.md).

Before changing settings, the runbook exported a configuration snapshot containing project IDs, Git source, root, framework, install/build/output settings and deployment IDs. It included environment names/scopes only, and verified the old production deployment remained available.

Preview validation: each app was built from its branch with its proposed root, then assets, navigation, redirects and API routing were verified. An app-only change affected one preview and a shared-package change affected its consumers. The GitHub affected checker owned validation selection; Vercel deployment selection had to be verified separately.

Rollback: the previous deployment was promoted for only the affected project and its saved root/build/install/Git-source settings were restored. Reverting code alone was insufficient after a root or repository change. n3wth/ui and public package publishing stayed intact throughout the pilot.

## Production deployment record

| Project | Workspace production | Previous production |
| --- | --- | --- |
| n3wth | dpl_GqqYgKhSJbafRf4b8sqpqGMb95N4 | dpl_GAdTbz6LsaGHevAK8CnjHfQZqMRt |
| ui | dpl_EPbAurrHy3TSqybLiMYHJHMovN96 | dpl_4Do4hHkL1jrv78fkivi7WC5tw1aS |

Previous n3wth settings: repository n3wth/n3wth, root null, framework vite, Node 24.x, build/install/output null. Previous ui settings: repository n3wth/ui, root null, framework vite, Node 24.x, build npm run demo, install/output null. Both allowed source files outside the app root. Existing environment scopes were preserved during rollback.

Portfolio, Garden, Kit, Skills and r3 built through the root app-targeted scripts so shared UI was built once first; UI docs used `cd ../.. && npm run build:ui-docs`. Their outputs were app-local dist or Next output. Each app used scripts/vercel-ignore.mjs to select deployment from the same affected graph as CI. Missing or invalid comparison history built safely instead of skipping.
