# Cloudflare Preview Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement each bounded task and review the integrated result.

**Goal:** Deliver a verified UI docs preview pilot and reusable, safe PR preview lifecycle for the six-site migration.

**Architecture:** Start with the existing prerendered UI docs build served by Workers Static Assets. A repository-owned deploy script creates a deterministic PR config and exact Custom Domain; CI builds without secrets, deploys same-repository PRs, and cleans up closed previews. Additional app adapters are enabled only after their runtime checks pass.

**Tech Stack:** Node 24, npm 11.19.1, Wrangler 4, Workers Static Assets, GitHub Actions, existing Vite/Next workspaces.

**Spec:** `docs/workspace/cloudflare-migration.md`.

## Global constraints

- Preserve production and Vercel configuration during preview preparation.
- Next.js upgrades authorized for adapter compatibility; no UI redesign or framework replacement; one root lockfile.
- Use the fixed app allowlist and validated PR number for all names and cleanup.
- Exact custom domains, no wildcard TLS assumption; previews noindex.
- No production data credentials in previews; fork PRs cannot deploy.
- Independent workers own disjoint files and do not revert other changes.

## Task 1: UI docs static runtime

Files: create `apps/ui-docs/wrangler.jsonc`, `apps/ui-docs/public/_headers`, `apps/ui-docs/public/_redirects`; add focused runtime regression tests only if needed. Controller owns root dependency changes.

Interface: base config named `n3wth-ui-docs-preview`, compatibility date 2026-09-18, assets `./dist`, clean routes, explicit custom 404 behavior, no production domain. Deployment script overrides name and routes through generated config adjacent to the app config.

- [ ] Preserve Vercel's security/cache headers in `_headers`, use immutable `/assets/*`, default revalidation for HTML, and preview-only noindex injected in staged assets (not production source).
- [ ] Preserve `/docs` redirect and current clean URL behavior. Choose and validate HTML handling against prerendered directories.
- [ ] Run `npm run build:ui-docs`, app typecheck/tests, Wrangler dry run and local workerd checks for 200, redirects, 404, assets and headers.

## Task 2: Preview configuration and lifecycle

Files: create `scripts/cloudflare-preview.mjs`, `scripts/cloudflare-preview.test.mjs`; controller owns CI workflow and package.json.

Interface: CLI `node scripts/cloudflare-preview.mjs <deploy|delete|config> --app ui-docs --pr <positive-integer>`. Use local pinned Wrangler through argument-array subprocess invocation. `config` produces deterministic generated JSON config without deploying. `deploy` stages preview-only assets/headers, deploys exact named Worker + custom domain. `delete` removes only that exact named preview and associated owned domain/certificate if safely attributable. Missing Worker is an idempotent success; authentication/network errors fail.

- [ ] Validate action, app allowlist and number before filesystem or remote changes.
- [ ] Never accept arbitrary account/domain/name flags; account comes from `CLOUDFLARE_ACCOUNT_ID`, exact preview host suffix is fixed.
- [ ] Do not persist secrets or overwrite source assets. Ignore generated `.cloudflare` and Wrangler state.
- [ ] Test accepted/rejected inputs, stable naming, source config immutability and cleanup error behavior without network calls.

## Task 3: CI, live pilot and review

Files: `.github/workflows/cloudflare-preview.yml`, root package manifest/lock and `.gitignore`, migration docs.

- [ ] Use pull_request opened/synchronize/reopened/closed; trusted same-repo only; no pull_request_target.
- [ ] Build/test with Node24/npm11 and no CF secret; deploy only after checks. Expose CF token only at deploy/cleanup steps. Detect changed app via existing graph; special-case infrastructure changes to rebuild supported pilot apps.
- [ ] Serialize by PR; verify open state before deploy to prevent resurrection after cleanup. Workflow close cleanup runs even if last diff did not affect the app.
- [ ] Validate tests/build and local runtime. Deploy a pilot preview, verify custom-domain TLS and content using HTTP and browser. Record exact commit/environment/URL.
- [ ] Review diff, create feature-branch PR, attach to task and Linear, verify CI. Update Linear statuses according to actual evidence.

## Follow-on tasks

Portfolio APIs and each Next adapter are separate Linear issues depending on the verified preview lifecycle. Production cutover depends on all relevant app acceptance evidence, and database replacement depends on live source inventory plus a restored-copy test. These are tracked work, not implied completion of this pilot.
