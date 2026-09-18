# Vercel audit

Linear N-717, "Retire redundant builds and verify realized hosting savings". Snapshot facts collected 2026-09-18. Sources: `cloudflare-migration.md`, `build-performance.md`, `deployment.md`, `environments.json`, `apps/*/vercel.json`, `scripts/check-invariants.mjs`, `satellites.md`.

This document is a reference for the retirement decision. It does not authorize any billing or project change by itself.

## 1. Inventory of all 13 Vercel projects

| Project | Production URL / domain | In migration scope | Notes |
| --- | --- | --- | --- |
| n3wth | n3wth.com | Yes (portfolio) | Root `apps/portfolio`, framework Vite |
| ui | ui.n3wth.com | Yes (ui-docs) | Root `apps/ui-docs`, framework Other |
| garden | garden.n3wth.com | Yes | Root `apps/garden`, framework Next.js |
| kit | kit.n3wth.com | Yes | Root `apps/kit`, framework Next.js |
| skills | skills.n3wth.com | Yes | Root `apps/skills`, framework Next.js |
| r3 | r3.n3wth.com | Yes (r3-web) | Root `apps/r3-web`, framework Next.js |
| lunchmoney-landing | lunchmoney.sh | No | Unrelated product, preserve untouched |
| lunchmoney-mcp | mcp.lunchmoney.sh | No | Unrelated product, preserve untouched |
| grosvenornewth | grosvenornewth.com | No | Preserve untouched |
| theywontshutup | theywontshutup.com | No | Preserve untouched |
| markup | markup-n3wth.vercel.app | No | Preserve untouched |
| hop | hop-n3wth.vercel.app | No | Preserve untouched |
| n3wth-ui-v2 | n3wth-ui-v2-n3wth.vercel.app | No | Preserve untouched |

Six of the 13 projects are the Cloudflare migration scope. The other seven are unrelated products or previews. Team: Vercel team `n3wth`, user `oliv3r`.

## 2. Domains held at Vercel

Source: `vercel domains ls --scope n3wth` on 2026-09-18 (17 domains reported, 16 listed; one row did not print).

| Domain | Registrar | Nameservers | Expiration |
| --- | --- | --- | --- |
| lunchmoney.sh | Vercel | Vercel | Sep 14 2027 |
| n3wth.space | Vercel | Vercel | Aug 30 2027 |
| hop.flights | Third party | Third party | not shown |
| bymayor.com | Vercel | Vercel | Apr 27 2027 |
| getmayor.com | Third party | Third party | not shown |
| ponyforge.com | Third party | Third party | not shown |
| mayor.pm | Third party | Third party | not shown |
| mayor.wtf | Third party | Third party | not shown |
| ucbbookings.com | Third party | Third party | not shown |
| theywontshutup.com | Vercel | Vercel | Jan 31 2027 |
| grosvenornewth.com | Third party | Third party | not shown |
| evanswope.com | Third party | Third party | not shown |
| n3wth.com | Third party | Third party | not shown |
| newth.wiki | Third party | Third party | not shown |
| newth.garden | Third party | Third party | not shown |
| newth.art | Third party | Third party | not shown |

Four domains are registered through Vercel: lunchmoney.sh, n3wth.space, bymayor.com and theywontshutup.com. Do not change the Vercel account, team or plan in a way that affects these registrations. `n3wth.com` is registered with a third-party registrar. Its zone is on Cloudflare. The apex, www, ui, garden, kit, skills and r3 records point at Vercel today. `r2.n3wth.com` points at Cloudflare R2. Those DNS records are covered separately by the migration's DNS cutover, not by this billing audit.

## 3. Integrations

Per the migration contract (dashboard confirmation pending): `newth-skills` is a database in the Vercel-managed Neon Launch organization. A Vercel-managed Neon organization implies Marketplace billing through Vercel. Confirm this on the Integrations page.

Not confirmed: `vercel integration list --scope n3wth` returned "No resources found" when run from an unlinked directory. This does not prove no integrations exist; it means the CLI needs to run from a linked project directory, or the result must be read from the dashboard.

Checklist before any billing change:
- Open the Vercel dashboard Integrations/Marketplace page for the `n3wth` team and list every active integration, not just Neon.
- Confirm which project(s) each integration is attached to and its billing plan.
- Confirm whether the Neon `newth-skills` database is still needed after cutover. It becomes redundant once the D1 (or fallback Neon) data migration for Skills completes. Do not act on this without a separate explicit request. This audit only records the state.
- Confirm whether the $100/month custom preview suffix add-on is actually enabled on the account. The migration contract treats this as an avoided purchase, not a confirmed current charge.

## 4. Env scopes per migrated project

Names only, from `docs/workspace/environments.json`. No values are recorded here or anywhere else.

| Project | Variable names (scopes) |
| --- | --- |
| n3wth | GEMINI_API_KEY (production, preview), OPENROUTER_API_KEY (production, preview), POSTHOG_PERSONAL_API_KEY (production) |
| ui | none recorded |
| garden | none recorded |
| kit | none recorded |
| skills | POSTHOG_PERSONAL_API_KEY (production), NEXT_PUBLIC_AXIOM_TOKEN (production), NEXT_PUBLIC_AXIOM_DATASET (production), GOOGLE_GENERATIVE_AI_API_KEY (production), AI_GATEWAY_API_KEY (development, preview, production), SENTRY_PUBLIC_KEY (production, preview), SENTRY_OTLP_TRACES_URL (production, preview), SENTRY_VERCEL_LOG_DRAIN_URL (production, preview), VERCEL_GIT_COMMIT_SHA (production, preview), SENTRY_AUTH_TOKEN (production, preview), SENTRY_DSN (production, preview, development), SENTRY_PROJECT (production, preview), SENTRY_ORG (production, preview), POSTGRES_URL (production, preview, development), NEON_AUTH_BASE_URL (production, preview, development), POSTGRES_PRISMA_URL (production, preview, development), DATABASE_URL_UNPOOLED (production, preview, development), POSTGRES_URL_NON_POOLING (production, preview, development), PGHOST (production, preview, development), POSTGRES_USER (production, preview, development), DATABASE_URL (production, preview, development), POSTGRES_PASSWORD (production, preview, development), POSTGRES_DATABASE (production, preview, development), PGPASSWORD (production, preview, development), PGDATABASE (production, preview, development), PGHOST_UNPOOLED (production, preview, development), PGUSER (production, preview, development), POSTGRES_URL_NO_SSL (production, preview, development), POSTGRES_HOST (production, preview, development), NEON_PROJECT_ID (production, preview, development), VITE_NEON_AUTH_URL (production, preview, development) |
| r3 | POSTHOG_PERSONAL_API_KEY (production), NEXT_PUBLIC_AXIOM_TOKEN (production), NEXT_PUBLIC_AXIOM_DATASET (production) |

"None recorded" means `environments.json` lists the project with an empty variable array. It does not prove the live Vercel project has zero env vars; verify in the dashboard before deleting any project record.

## 5. Baseline figures for the savings comparison

Copied from the migration contract's Current evidence section, with dates:

| Item | Figure | Date range |
| --- | --- | --- |
| Vercel Pro base fee | $20/month plus $20 usage credit | ongoing |
| Vercel build cost | $9/day | Sep 4-10 2026 |
| Vercel build cost | $4.06/day | Sep 11-17 2026 |
| Vercel build cost | $1.76/day | Sep 14-17 2026 |
| Cloudflare Workers Paid | $5/month, includes 6,000 Workers Build minutes; overage $0.005/minute | ongoing, already active |
| Custom preview suffix | $100/month, avoided purchase unless billing proves it is enabled | not confirmed as billed |

The Sep 16 optimization has insufficient post-change observations to attribute all of the Sep 11-17 decline to it. Treat the daily figures as a downward trend, not a stable baseline.

Measurement method after cutover: wait for one full Vercel billing cycle with no mid-cycle configuration changes. Record the build count and cache-hit state for that cycle. A cycle with forced full builds is not comparable to a cycle with warm cache; see `build-performance.md`. Count GitHub Actions minutes separately from Cloudflare Workers Build minutes. Do not merge the two allowances. Do not imply CI is free because Workers Build minutes are unused. Compare the resulting Vercel invoice line items against the pre-cutover daily figures above. Scale the pre-cutover figures to the same number of days.

## 6. Retirement checklist

Apply this per migrated app, only after that app's Cloudflare cutover is live and rollback evidence (previous Vercel production deployment ID and Git SHA, per `deployment.md` and `satellites.md`) is recorded.

1. Confirm the Cloudflare deployment is serving production traffic and the rollback record for the app exists.
2. Stop automatic Git deployments for that Vercel project, using one of:
   - Dashboard: Settings > Git > Disconnect the repository. Note: this also removes preview deployments for that project.
   - Repo: set `git.deploymentEnabled: false` in the app's `vercel.json`.
3. If you set `git.deploymentEnabled` to `false`, update `scripts/check-invariants.mjs` in the same pull request. That script requires `git.deploymentEnabled` to be `true` for every app. Update `scripts/check-invariants.test.mjs` in the same pull request.
4. Keep the Vercel project, its last production deployment, and its environment variables in place for rollback, for at least one full Vercel billing cycle after cutover.
5. Do not delete the project, its data, the Neon database, or any domain as part of this step. Deletion requires a separate explicit request.

Do this one app at a time, matching the migration contract's one-app-at-a-time rollout gate.

## 7. Out-of-scope projects to preserve untouched

lunchmoney-landing, lunchmoney-mcp, grosvenornewth, theywontshutup, markup, hop, n3wth-ui-v2. None of these are part of the Cloudflare migration. Do not change any config, billing or deployment setting for these projects as a result of this audit or the retirement checklist in section 6.
