# Cloudflare migration contract

Status: approved for implementation, 2026-09-18. Production cutover requires the evidence below.

Tracking: [Linear project](https://linear.app/newth/project/cloudflare-sites-and-preview-migration-4c87015317be).

## Outcome and scope

Host the six n3wth applications on Cloudflare and provide automatic PR previews at `<app>-pr-<number>.preview.n3wth.com`. Reduce recurring hosting/build charges while preserving routes, redirects, status codes, public metadata, static assets, API behavior, authentication and design. Keep Node 24, npm 11.19.1, the root lockfile and shared workspace build graph. The user subsequently authorized upgrading Next.js to supported stable versions for the current OpenNext adapter; verify each app before enabling its Cloudflare deployment.

Hosting and Skills database/auth migration are independent releases. Hosting previews initially retain current data providers. Never point previews with unreviewed code at production write credentials. No redesign, framework replacement, deletion of source data, or unrelated dependency upgrades; the authorized Next.js upgrade is scoped to compatibility and relevant peer dependencies.

## Current evidence

- Vercel n3wth is Pro, one deploying seat, $20/month and $20 usage credit. Recent build cost fell from $9/day (Sep 4–10) to $4.06/day (Sep 11–17). Sep 14–17 averaged $1.76/day. The Sep 16 optimization has insufficient post-change observations to attribute all the decline to it.
- Cloudflare Workers Paid is already active at $5/month. It includes 6,000 Workers Build minutes; overage is $0.005/minute. Static asset requests are treated separately from Worker execution. GitHub Actions builds consume GitHub allowances, not Workers Build minutes; do not double-count the allowance or promise zero CI cost.
- Equivalent build-duration scenario previously estimated roughly $25/month saving if Vercel Pro is retained or $45/month if it can be discontinued. These are scenarios, not measured Cloudflare results.
- Vercel's $100/month custom preview suffix is an avoided purchase unless billing proves it is currently enabled. Do not add $100 to observed savings automatically.
- The Cloudflare account is `ac23513945eb49f73a89faf1be12384e`; n3wth.com zone is `5e3780e8b6272182ea60a146ede42577`. Zone subscription is externally managed Enterprise; Workers Paid is separate.
- Skills has unconfigured Supabase code and a populated Neon database. The user confirmed there is no Supabase data to preserve. `newth-skills` is in the Vercel-managed Neon Launch organization, not the separate personal Free organization. Live read-only inventory on September 18 found 7 votes, 892 analytics events, 0 feature requests and 0 Neon auth users. Neither usage table exists. Preserve the populated tables and their IDs/timestamps; take a fresh snapshot before cutover.

## Runtime design

Reuse the existing public R2 media origin `https://r2.n3wth.com` (verified active custom domain on bucket `n3wth-personal`, also exposed as `r2.newth.ai`). Portfolio already links its resume there. Preserve existing object keys and URLs. Use it for public shared media/downloads where needed, not auth records, database backups, private uploads, build secrets or mutable per-PR application bundles. Keep versioned application assets inside each Worker deployment for atomic deploy/rollback. No blanket asset migration is required by this hosting change.

| App | Target | Required preservation |
| --- | --- | --- |
| ui-docs | Workers Static Assets | Prerendered HTML, `/docs` redirect, genuine 404s, cache/security headers, clean URLs |
| portfolio | Workers Static Assets plus fetch handler | `/api/agent`, `/api/search`, `/api/github-stats`, redirects, SPA/prerender rules |
| garden | Next.js with OpenNext Cloudflare adapter | File-backed notes, `/random`, proxy behavior, OG fonts/assets, metadata |
| kit | Next.js with OpenNext Cloudflare adapter | Webhook validation, OG routes, static registry/install paths |
| skills | Next.js with OpenNext Cloudflare adapter | Auth cookies/callback, `/create`, votes/comments, existing database integrations |
| r3-web | Next.js with OpenNext Cloudflare adapter | MDX/docs routes, redirects, OG generation, download/install behavior |

Use current OpenNext with supported stable Next versions. Any `runtime = 'edge'` declarations need an adapter-compatible runtime. Validate Next 16 proxy behavior in workerd; local Next builds alone do not establish compatibility. Keep Vercel config and deployment policy operational until a per-app cutover issue records its replacement.

## Preview contract

- Worker name: `n3wth-<app>-pr-<number>`; host: `<app>-pr-<number>.preview.n3wth.com`. Slugs are from a fixed app allowlist; number is a positive integer. No branch names, user-supplied domains or arbitrary deletion targets.
- Deploy a separate Worker for each PR/app. Native version preview URLs support only workers.dev and cannot supply the requested hostname.
- Register exact Workers Custom Domains; Cloudflare provisions the DNS record and certificate for each hostname. Do not assume Universal SSL covers `*.preview.n3wth.com`, and do not purchase Advanced Certificate Manager for this design.
- Build only affected applications using `scripts/affected.mjs` and the workspace dependency graph. Shared-package changes include all consumers. Preview-infrastructure changes must rebuild supported pilot apps even though deployment selection currently ignores `.github/`.
- Do not use `pull_request_target` to execute PR code with secrets. Fork PRs never receive deployment credentials. Same-repository PRs are the initial trusted automation boundary.
- Build/check without deployment credentials, then expose the scoped Cloudflare credential only to the deploy step. Use read-only GitHub contents permissions unless an explicitly needed status API requires more.
- Serialize deployment and cleanup for each PR. On close, delete only deterministic preview resources owned by this workflow. Handle missing resources idempotently. Do not let an older queued build recreate a closed PR preview.
- Cleanup detaches the verified exact Workers Custom Domain before deleting the Worker. Cloudflare manages its DNS and certificate lifecycle; the script does not delete a separately identified certificate. Verify DNS cleanup after the live pilot closes.
- Preview pages send `X-Robots-Tag: noindex, nofollow`; canonical production URLs stay unchanged. Runtime auth allowlists/cookie domains and callback redirects must use the actual preview origin safely.
- Keep production data mutations unavailable until an isolated preview database/auth configuration is verified. A successful static pilot does not imply Skills is ready.

## Data decision gate

Preferred target after the user's Better Auth clarification: **D1 + Better Auth**, with Neon as fallback if the runtime rehearsal exposes a material blocker. Better Auth 1.5 introduced native D1 binding support and uses D1 batches; a separate ORM is not required. Verify the current pinned release with a synthetic magic-link/session test in workerd before adapting the app. Better Auth is application-hosted auth, not a Cloudflare-managed auth service; email delivery still needs a configured sender.

The user confirmed Skills has no Supabase data to preserve. Implement fresh auth/profile/comment/authenticated-upvote tables; omit the legacy Supabase export and identity bridge. Existing Neon vote/analytics/usage data still requires inventory and preservation. The local Better Auth 1.7.5 + D1 workerd spike passed magic-link redemption/replay rejection, session/signout, hostile-origin rejection and fixed UUID preservation.

D1 is managed SQLite and includes no replacement for Supabase end-user auth. A D1 design must include an established auth library/provider, email delivery, user/session tables, authorization checks and a concrete PostgreSQL-to-SQLite conversion. Do not equate Cloudflare Access with public application login.

Neon preserves PostgreSQL, already has an app integration, and offers managed Better Auth with magic links and a Supabase-compatible query client. Even there, Supabase `auth.users` foreign keys, `auth.uid()` policies, profile triggers and cookie/callback handling require migration and testing. Existing sessions may require deliberate reauthentication.

Before selecting or provisioning the production replacement: inventory schemas, counts, sizes, extensions, auth methods and other app consumers; verify a restorable backup; compare the actual Supabase invoice with incremental Neon or D1+auth/email cost. Preserve stable app user identifiers or implement a complete audited identity mapping. Preserve anonymous and authenticated vote totals without double counting.

## Validation and rollout gates

1. Baseline: clean install and existing target app checks pass on the isolated feature branch. Record unrelated failures separately.
2. Preview: build using the Cloudflare adapter, perform a Wrangler dry run, deploy a nonproduction hostname, and verify real HTTPS, redirect chains, route bodies, assets, caching, missing-route behavior and canonical metadata. Verify desktop/mobile browser navigation and absence of runtime errors.
3. Lifecycle: open/update/close a test PR; check affected app selection, stable preview URL, new commit contents and resource cleanup. Fork PRs skip deployment. No production secrets in artifacts/logs.
4. App rollout: snapshot current domain/DNS, deployment IDs and relevant env names/scopes. Cut over one verified app at a time. Verify real production routes, APIs, robots/sitemap and auth. Keep previous Vercel deployment ready for rollback.
5. Data migration: restored copy, count/checksum/constraint comparison, auth identity mapping, permission tests, duplicate/replayed operation tests, isolated preview tests, final write freeze/delta copy and verified rollback. Never silently dual-write.
6. Billing cleanup: stop redundant Vercel builds only after Cloudflare auto-deploys and rollback are demonstrated. Audit all 13 Vercel projects and Marketplace integrations before changing Pro or Neon billing. Record actual build duration and charges over the next full billing cycle.

## Acceptance cases

- UI `/docs` redirects to `/docs/getting-started`; a real documentation URL returns its prerendered content; unknown paths return 404 rather than home HTML; assets retain immutable caching.
- A PR affecting one app deploys that app; a UI package change deploys all configured consumers; documentation-only root edits do not rebuild apps.
- Closing a PR removes its preview, and a delayed run cannot recreate it. Cleanup cannot target production Workers or unrelated Cloudflare resources.
- An unauthenticated Skills request cannot write a comment/upvote or enter `/create`; user A cannot delete user B's comment; duplicate votes remain unique; magic-link callbacks persist the correct session.
- Preview and production webhooks preserve signatures and replay behavior; public search and agent streaming preserve request/response semantics.

## References

- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Worker preview URL limitations](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
- [Static assets routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [Neon Supabase migration](https://neon.com/docs/auth/migrate/from-supabase)
- [Neon magic links](https://neon.com/docs/auth/guides/plugins/magic-link)
- [Better Auth native D1 support](https://better-auth.com/blog/1-5)
- [Better Auth magic links](https://www.better-auth.com/docs/plugins/magic-link)
