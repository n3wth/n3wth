# Satellite workspace inventory

N-408 source audit, September 6 2026. Local manifests, route files, Vercel configs and clean git status verified. No code, hosting or DNS changes. Builds were not rerun for this documentation task; validation results below are the recorded maintenance baseline in `outputs/site-maintenance.md`, not fresh results. Live Vercel settings, environment variable names/scopes, DNS records and current production commit remain unverified.

| Site | Repository and local checkout | Audited HEAD | Framework | App root and validation |
| --- | --- | --- | --- | --- |
| garden.n3wth.com | n3wth/newth-garden; /private/tmp/swarm-align/garden | 99dae2e1e2f9cbf35608a7463120fe57a4a6113a | Next 16.2.9, React 19.2.3, Astryx 0.1.5, Tailwind 4 | Repository root; Node 24; npm ci; npm run check = typecheck + next build --webpack |
| skills.n3wth.com | n3wth/skills; /private/tmp/swarm-align/skills | 60e9615d246a94ba1b7b8c240f8690b156582c84 | Next ^16.1.6, React ^19.2.0, UI ^0.6.1, Tailwind 4 | Repository root; Node 24; npm ci; npm run check = typecheck + lint + unit tests + build |
| kit.n3wth.com | n3wth/kit; /private/tmp/swarm-align/kit | 12905216b92449221baad4f699b44be65f985248 | Next 16.2.9, React 19.2.3, UI ^0.9.1, Tailwind 4 | Repository root; Node 24; npm ci; npm run check = typecheck + build |
| r3.n3wth.com | n3wth/r3; /private/tmp/swarm-align/r3 | e98cd996ee116ba3c7309b51395a54295c7d01ba | Next 15.5.19, React 19.1.0, UI ^0.9.1, Tailwind 4 | website/; Node 24; npm ci; npm run check = typecheck + next build --turbopack |

All audited checkouts are clean feature branches. Their maintenance commits are PR heads, not necessarily current main. Garden PR59, Skills PR191 and Kit PR30 were recorded merged and deployed; r3 PR62 was recorded open with failing core tests. Fetch and resolve current main again before import. Do not copy these branches wholesale into the migration.

## Garden

- Preserve `/`, `/notes`, `/world`, `/graph`, `/tags`, `/tags/[tag]`, catch-all note slugs, `/random`, `/feed.xml`, `/llms.txt`, AI search API and generated sitemap/robots.
- Committed Vercel config contains temporary `/home` → `/` redirect. Actual dashboard root and overrides are unknown.
- Preserve Markdown content, assets, link graph and generated metadata. Preserve the production Astryx runtime shim and OG font tracing in Next configuration. No actual UI package dependency currently; adapter/token extraction is safer than replacing the component system.
- Recorded baseline: typecheck/build pass. No test runner/lint baseline exists in package scripts.

## Skills

- Preserve skill detail paths, bundles, curated bundles, workflows and optional workflow-builder IDs, auth callback, comments/voting/health APIs and static discovery endpoints. Source contains additional routes; generate a complete route manifest before cutover.
- Committed Vercel settings: npm ci, clean URLs, no trailing slash, temporary `/home` redirect, selected skill noindex headers and site-specific CSP/security headers.
- Published UI 0.6.1 dependency differs from newer consumers. Upgrade independently with API and visual checks. Previous implicit sibling UI alias was removed. Legacy Vite scripts remain and must not be deleted without consumer evidence.
- Supabase/auth and AI integration configuration must be inventoried before migration; do not copy a generic CSP over existing service requirements.
- Recorded baseline: typecheck/lint, 283 unit tests and build pass.

## Kit

- Preserve `/components`, `/docs` and integration-specific docs, `/blog` articles, `/changelog`, webhook/waitlist APIs, public registry artifacts and AI context packs.
- Committed Vercel config specifies npm ci only; dashboard settings unknown. Preserve registry build contract (`registry:build`) and Stripe webhook destination/validation independently of frontend movement.
- Recorded baseline: typecheck/build pass. Existing lint reports 18 errors and 4 warnings and is not included in the current check script. Do not misreport lint as passing or remove any required gate during migration.

## r3 website

- Preserve `/docs/[[...slug]]`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` and existing static/MDX assets.
- Root Vercel config changes into website for install/build, outputs website/.next and skips non-production builds. Nested website/vercel.json instead uses local commands/output, iad1 region and main deployment flag. Actual dashboard root must be established before choosing one authoritative configuration.
- Website move must not move the published @n3wth/r3 CLI/core package, Redis integration tests, release scripts or version synchronization blindly. Core React 18 and runtime requirements differ from website React 19/Node 24.
- Recorded website typecheck/build pass with existing parent ESLint warning. Core add/search memory timeouts and concurrent-request assertion fail in PR62; intelligence tests passed 5/5. Separate core work must not block unrelated site migration. Root build masks errors with `|| true`; retain explicit compiler validation.

## Rollback and cutover requirements

Keep existing repositories, Vercel projects and domains until each migration passes a production smoke check and rollback rehearsal. Before each switch, record the actual production deployment ID and Git SHA, root/build/install/output settings, environment names and scopes (never values), integrations and public route manifest. Rollback restores the prior project configuration and promotes the recorded deployment without changing public domains. Recorded historical successful deploy links and merge SHAs are useful references, not verified present-day rollback targets.

Later migrations can proceed independently after the portfolio/UI pilot is validated. Shared package or framework upgrades should remain distinct from file movement so failures are attributable and rollback stays small.

## Live Vercel follow-up

Read-only `vercel project inspect <project> --scope n3wth` succeeded for all four projects on September 6. This supersedes the unknown dashboard-root/runtime statements above. Environment settings, DNS and current production deployment commits were not queried.

| Project | Project ID | Dashboard root | Dashboard Node |
| --- | --- | --- | --- |
| garden | prj_VHe8C5iS0N8qEvpjKTtceyUkbiyA | . | 24.x |
| skills | prj_LPRdpDZtoXAigpYRTO5RE0Xdomh7 | . | 24.x |
| kit | prj_HAoL99W0O566XE7zZqOaFVDHogqA | . | 24.x |
| r3 | prj_oN4gbrt2gqJ339it8PcijAI3EFrS | website | 22.x |

All four use the Next.js framework preset with default build (`npm run build` or `next build`), default Next.js output and automatic package-manager install in the dashboard. Committed vercel.json overrides still need to be interpreted at the selected root; inspect does not prove the final deployment command. In particular r3 selects website/, making its nested config relevant; its dashboard remains Node 22 while the unmerged website maintenance branch specifies Node 24. Do not claim r3 is already on the Node 24 production baseline.

## Independent pilot architecture/checklist review

Reviewed `work/sites-workspace/docs/workspace/architecture.md`, `deployment.md` and root package.json. Boundaries, package publishing authority, per-project rollback and preserving portfolio custom UI are appropriate. Additional acceptance details to make explicit before cutover:

- Verify root-lock install behavior in an actual Vercel preview. The checklist says install from repository root but should record the exact effective install command and current working directory; an app-root npm ci assumption alone is insufficient.
- Smoke-test portfolio serverless endpoints and environment scope at preview and production. Moving api/ with the application changes function discovery context even when the source is unchanged.
- Preserve UI package distribution files and license notices and compare npm pack file lists against the source version. A successful docs consumer build alone does not prove all public export paths/fonts remain publishable.
- Define how fixes to the still-authoritative n3wth/ui package repo reach the imported copy during the pilot, or hold package changes temporarily. Two editable copies can drift even with one publishing authority.
- Ensure rollback also prevents the next automatic Git deployment from immediately restoring the broken cutover; restore Git source/root before resuming normal merges.
- Treat framework-version differences in later Next apps as intentional. Root hoisting must not silently upgrade React or Next beyond each app's validated graph.

These are implementation validation details rather than reasons to delay the isolated pilot branch. No other files were edited.
