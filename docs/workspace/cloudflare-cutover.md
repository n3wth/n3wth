# Cloudflare production cutover runbook

Linear: N-715, "Cut over validated sites to Cloudflare with per-app rollback" (title confirmed against Linear on 2026-09-18).

This document is a runbook. It does not authorize any production switch. See section 6.

Snapshot date for this document: 2026-09-18. The facts below come from the repository sources cited in each line, plus a controller snapshot taken the same day. Every claim without a source is marked "unverified".

## 1. Purpose and preconditions

This runbook describes how to move the six n3wth applications from Vercel production to Cloudflare Workers production, one app at a time. It describes the procedure only. It does not record a completed move.

Meet every precondition below before you switch any app.

- Confirm the app passed its own preview acceptance gate in `docs/workspace/cloudflare-migration.md`, under Validation and rollout gates, step 2 and step 4. A passing preview build is not the gate on its own. The acceptance cases for that app must also pass.
- Confirm the Vercel project, the domain, and the environment variables for the app remain in place and unchanged.
- Confirm the approver has read the rollback path in section 5.
- Keep the hosting migration and the Skills data and auth migration as separate releases. Do not treat a hosting cutover as cover for a data migration. Do not cut Skills to Cloudflare production until the data decision gate in `cloudflare-migration.md` closes and passes testing. That gate chooses D1 with Better Auth, or Neon.

## 2. Snapshot record

The controller collected the snapshot facts below on 2026-09-18. Sources: `dig`, `curl -I`, and recorded values in `docs/workspace/deployment.md`, `docs/workspace/satellites.md`, and `docs/workspace/environments.json`.

Read these three qualifiers before you use any row.

- The "Observed 2026-09-18" response-header lines come from `curl -I` and `dig` runs on that date. Re-run `curl -I` at pre-check time.
- Each "Build (dashboard)" and "Install (dashboard)" row records a Vercel project setting. The committed `vercel.json` for each app overrides those settings on every deployment. Reproduce the committed command, not the dashboard command. Both rows appear in each table.
- Some rows below conflict with the 2026-09-06 audit in `satellites.md`. This document calls out each conflict in place. Resolve every conflict against the live dashboard at pre-check time.
- Every "Env var names and scopes" row comes from `environments.json`. It lists names and scopes only. Never add a value to this document. `deployment.md` records a production deployment ID for the n3wth and ui projects only, so the other four rows stay unverified.

### Portfolio (n3wth)

| Field | Value |
| --- | --- |
| Vercel project ID | prj_ZiimaNLqgocwBC7elQp5cRQuu9cH |
| Root | apps/portfolio |
| Framework | Vite |
| Build (dashboard) | `npm run build` (framework preset Vite; `vercel project inspect`, 2026-09-18) |
| Build (committed `vercel.json`, effective) | cd ../.. && npm run build:portfolio -- --cache-ui |
| Install (dashboard) | `cd ../.. && npx --yes npm@11.19.1 ci` (`vercel project inspect`, 2026-09-18) |
| Install (committed `vercel.json`, effective) | node ../../scripts/vercel-install.mjs @n3wth/portfolio |
| Output | dist |
| Node | 24.x (`vercel project inspect`, 2026-09-18) |
| Production hostname | n3wth.com |
| Current DNS target | A 216.150.1.1 (Vercel apex) |
| Last known production deployment ID | dpl_GqqYgKhSJbafRf4b8sqpqGMb95N4 (workspace production, from `deployment.md`) |
| Env var names and scopes | GEMINI_API_KEY (preview, production); OPENROUTER_API_KEY (preview, production); POSTHOG_PERSONAL_API_KEY (production) |

Observed 2026-09-18: n3wth.com responds with server Vercel and an x-vercel-id header. The recorded A record points at Vercel, so the host is not proxied by Cloudflare today.

### UI docs (ui)

| Field | Value |
| --- | --- |
| Vercel project ID | prj_qVXpXnohKgRXaNwzePTCGm9pvRD9 |
| Root | apps/ui-docs |
| Framework | Other |
| Build (dashboard) | cd ../.. && npm run build:ui |
| Build (committed `vercel.json`, effective) | cd ../.. && npm run build:ui-docs -- --cache-ui |
| Install (dashboard) | `cd ../.. && npx --yes npm@11.19.1 ci` (`vercel project inspect`, 2026-09-18) |
| Install (committed `vercel.json`, effective) | node ../../scripts/vercel-install.mjs @n3wth/ui-docs |
| Output | dist |
| Node | 24.x (`vercel project inspect`, 2026-09-18) |
| Production hostname | ui.n3wth.com |
| Current DNS target | CNAME f7ef3a26477f2860.vercel-dns-016.com |
| Last known production deployment ID | dpl_EPbAurrHy3TSqybLiMYHJHMovN96 (workspace production, from `deployment.md`) |
| Env var names and scopes | none recorded in `environments.json` |

Observed 2026-09-18: ui.n3wth.com responds with server Vercel and an x-vercel-id header.

The dashboard build command names the script `build:ui`. The committed `vercel.json` names `build:ui-docs`. The committed command wins. Build the Worker from `build:ui-docs`.

### Garden

| Field | Value |
| --- | --- |
| Vercel project ID | prj_VHe8C5iS0N8qEvpjKTtceyUkbiyA |
| Root | apps/garden (`vercel project inspect`, 2026-09-18; `satellites.md` recorded `.` on 2026-09-06, superseded) |
| Framework | Next.js |
| Build (dashboard) | npm run build |
| Build (committed `vercel.json`, effective) | cd ../.. && npm run build:garden -- --cache-ui |
| Install (dashboard) | cd ../.. && npx --yes npm@11.19.1 ci |
| Install (committed `vercel.json`, effective) | node ../../scripts/vercel-install.mjs @n3wth/garden |
| Output | Next.js default |
| Node | 24.x |
| Production hostname | garden.n3wth.com |
| Current DNS target | CNAME a9e46eddd63e0b42.vercel-dns-016.com |
| Last known production deployment ID | not recorded; unverified |
| Env var names and scopes | none recorded in `environments.json` |

Observed 2026-09-18: garden.n3wth.com responds with server Vercel and an x-vercel-id header.

The N-408 audit in `satellites.md` recorded dashboard root `.` and dashboard Node 24.x on 2026-09-06. That audit did not query environment settings, DNS, or the current production deployment commit. Confirm the root at pre-check time.

### Kit

| Field | Value |
| --- | --- |
| Vercel project ID | prj_HAoL99W0O566XE7zZqOaFVDHogqA |
| Root | apps/kit (`vercel project inspect`, 2026-09-18; `satellites.md` recorded `.` on 2026-09-06, superseded) |
| Framework | Next.js |
| Build (dashboard) | npm run build |
| Build (committed `vercel.json`, effective) | cd ../.. && npm run build:kit -- --cache-ui |
| Install (dashboard) | cd ../.. && npx --yes npm@11.19.1 ci |
| Install (committed `vercel.json`, effective) | node ../../scripts/vercel-install.mjs @n3wth/kit |
| Output | Next.js default |
| Node | 24.x |
| Production hostname | kit.n3wth.com |
| Current DNS target | CNAME 9243fcf1d14c2f6d.vercel-dns-016.com |
| Last known production deployment ID | not recorded; unverified |
| Env var names and scopes | none recorded in `environments.json`; the app reads STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET at runtime (`apps/kit/app/api/webhook/route.ts`); scopes for those two are unverified |

The N-408 audit in `satellites.md` recorded dashboard root `.` and dashboard Node 24.x on 2026-09-06. This pass did not re-verify either value.

### Skills

| Field | Value |
| --- | --- |
| Vercel project ID | prj_LPRdpDZtoXAigpYRTO5RE0Xdomh7 |
| Root | apps/skills (`vercel project inspect`, 2026-09-18; `satellites.md` recorded `.` on 2026-09-06, superseded) |
| Framework | Next.js |
| Build (dashboard) | npm run build |
| Build (committed `vercel.json`, effective) | cd ../.. && npm run build:skills -- --cache-ui |
| Install (dashboard) | cd ../.. && npx --yes npm@11.19.1 ci |
| Install (committed `vercel.json`, effective) | node ../../scripts/vercel-install.mjs @n3wth/skills |
| Output | Next.js default |
| Node | 24.x |
| Production hostname | skills.n3wth.com |
| Current DNS target | CNAME a9ef367b8a1c59a9.vercel-dns-017.com |
| Last known production deployment ID | not recorded; unverified |
| Env var names and scopes | POSTHOG_PERSONAL_API_KEY (production); NEXT_PUBLIC_AXIOM_TOKEN (production); NEXT_PUBLIC_AXIOM_DATASET (production); GOOGLE_GENERATIVE_AI_API_KEY (production); AI_GATEWAY_API_KEY (development, preview, production); SENTRY_PUBLIC_KEY (production, preview); SENTRY_OTLP_TRACES_URL (production, preview); SENTRY_VERCEL_LOG_DRAIN_URL (production, preview); VERCEL_GIT_COMMIT_SHA (production, preview); SENTRY_AUTH_TOKEN (production, preview); SENTRY_DSN (production, preview, development); SENTRY_PROJECT (production, preview); SENTRY_ORG (production, preview); POSTGRES_URL (production, preview, development); NEON_AUTH_BASE_URL (production, preview, development); POSTGRES_PRISMA_URL (production, preview, development); DATABASE_URL_UNPOOLED (production, preview, development); POSTGRES_URL_NON_POOLING (production, preview, development); PGHOST (production, preview, development); POSTGRES_USER (production, preview, development); DATABASE_URL (production, preview, development); POSTGRES_PASSWORD (production, preview, development); POSTGRES_DATABASE (production, preview, development); PGPASSWORD (production, preview, development); PGDATABASE (production, preview, development); PGHOST_UNPOOLED (production, preview, development); PGUSER (production, preview, development); POSTGRES_URL_NO_SSL (production, preview, development); POSTGRES_HOST (production, preview, development); NEON_PROJECT_ID (production, preview, development); VITE_NEON_AUTH_URL (production, preview, development) |

Skills carries the largest environment footprint. It also carries the database and auth migration. Do not cut Skills hosting to production before the data decision gate in `cloudflare-migration.md` closes.

### r3-web

| Field | Value |
| --- | --- |
| Vercel project ID | prj_oN4gbrt2gqJ339it8PcijAI3EFrS |
| Root | apps/r3-web (`vercel project inspect`, 2026-09-18; `satellites.md` recorded `website` on 2026-09-06, superseded) |
| Framework | Next.js |
| Build (dashboard) | npm run build |
| Build (committed `vercel.json`, effective) | cd ../.. && npm run build:r3 -- --cache-ui |
| Install (dashboard) | cd ../.. && npx --yes npm@11.19.1 ci |
| Install (committed `vercel.json`, effective) | node ../../scripts/vercel-install.mjs @n3wth/r3-web |
| Output | .next |
| Node | 24.x (`vercel project inspect`, 2026-09-18; `satellites.md` recorded 22.x on 2026-09-06, superseded) |
| Production hostname | r3.n3wth.com |
| Current DNS target | CNAME b0f374a726b659fa.vercel-dns-016.com |
| Last known production deployment ID | not recorded; unverified |
| Env var names and scopes | POSTHOG_PERSONAL_API_KEY (production); NEXT_PUBLIC_AXIOM_TOKEN (production); NEXT_PUBLIC_AXIOM_DATASET (production) |

The N-408 audit in `satellites.md` recorded dashboard root `website`, dashboard Node 22.x, and an unmerged maintenance branch specifying Node 24. The 2026-09-18 snapshot records root `apps/r3-web` and Node 24.x. Re-check both values in the dashboard at cutover time. Do not assume r3 production runs Node 24 until you confirm it.

### Other recorded facts

- Cloudflare account: ac23513945eb49f73a89faf1be12384e. Zone (n3wth.com): 5e3780e8b6272182ea60a146ede42577.
- R2 bucket in use for public media: n3wth-personal.
- Preview hostname suffix: preview.n3wth.com. Recorded live example, 2026-09-18, verified with `curl -I`: ui-docs-pr-341.preview.n3wth.com returned HTTP 200, and /docs returned a 301 to /docs/getting-started. The 301 matches `apps/ui-docs/public/_redirects`, which declares `/docs /docs/getting-started 301`.
- preview.n3wth.com holds no DNS record. It is a suffix for per-PR subdomains, not a host.
- r2.n3wth.com resolves to Cloudflare addresses 104.18.22.83 and 104.18.23.83. Cloudflare already proxies it. It is unrelated to the app hostnames above.
- `vercel integration list --scope n3wth` returned no resources from an unlinked directory. That result does not prove the absence of integrations. Confirm Marketplace resources in the dashboard, including the Neon database `newth-skills` in the Vercel-managed Neon Launch organization. `docs/workspace/vercel-audit.md` tracks this item, not this runbook.

## 3. Production Worker requirements per app

Apply every general requirement below to every app.

- Worker name convention, proposed and not yet in use for production: `n3wth-<app>`, for example `n3wth-portfolio`, `n3wth-ui-docs`, `n3wth-garden`, `n3wth-kit`, `n3wth-skills`, `n3wth-r3-web`. This mirrors the preview naming `n3wth-<app>-pr-<number>` in `scripts/cloudflare-preview.mjs`, minus the PR suffix. That script currently allows one app slug, `ui-docs`. Extend the allowlist before you rely on it for any other app.
- Keep each canonical origin unchanged. `packages/site-config/index.js` declares them in the frozen `siteUrls` object. Note that the portfolio origin uses the key `home`.
  - portfolio, key `home`: https://n3wth.com
  - ui: https://ui.n3wth.com
  - garden: https://garden.n3wth.com
  - kit: https://kit.n3wth.com
  - skills: https://skills.n3wth.com
  - r3: https://r3.n3wth.com
- Keep `X-Robots-Tag: noindex, nofollow` out of production assets. `scripts/cloudflare-preview.mjs` injects that header through `injectPreviewHeaders`, which writes a `_headers` file into the staged directory `.cloudflare/<app>-pr-<pr>/assets`. Point each production Worker config at the app's real asset directory. Do not run the injection step for production.
- Register one exact Workers Custom Domain per production hostname: n3wth.com, ui.n3wth.com, garden.n3wth.com, kit.n3wth.com, skills.n3wth.com, r3.n3wth.com. Do not register a wildcard domain. Cloudflare provisions the DNS record and certificate for each one. The preview contract in `cloudflare-migration.md` already relies on that behavior.
- Set secrets per Worker with `wrangler secret put <NAME>`. Run one command per name. Target the production Worker only. Write names only. Never write a value into this document or into any script argument list.

### Portfolio

- Serve `dist` as Workers Static Assets. Add a fetch handler for `/api/*`. Preserve the three existing API routes: `/api/agent`, `/api/search`, `/api/github-stats`. Their sources are `apps/portfolio/api/agent.ts`, `apps/portfolio/api/search.ts`, and `apps/portfolio/api/github-stats.ts`.
- Reproduce every redirect in `apps/portfolio/vercel.json` in the Worker. The file declares eight permanent redirects: `/frameworks` and `/frameworks/` to `/library`, and `/blog`, `/blog/`, `/news`, `/news/`, `/press`, `/press/` to `/thinking`. Reproduce the trailing-slash variants too. Reproduce the rewrite `"/api/(.*)"` to `"/api/$1"`. The file also sets `trailingSlash: false`.
- Preserve the header rules in `apps/portfolio/vercel.json`. Set `public, max-age=31536000, immutable` on `/assets/*` and `/fonts/*`. Set `public, max-age=0, must-revalidate` on every other path except `/assets/`, `/fonts/`, and `/api/`. Set X-Frame-Options DENY, X-Content-Type-Options nosniff, Strict-Transport-Security `max-age=63072000; includeSubDomains; preload`, Referrer-Policy `strict-origin-when-cross-origin`, and Permissions-Policy `camera=(), microphone=(), geolocation=()` on all paths.
- Secrets to set: GEMINI_API_KEY, OPENROUTER_API_KEY. Both carry preview and production scope in `environments.json`. POSTHOG_PERSONAL_API_KEY carries production scope only. Confirm at cutover whether the app reads POSTHOG_PERSONAL_API_KEY at request time or only at build time. Decide on a Worker secret after that check.

### UI docs

- The preview pilot already provides a static-asset Worker design. Its files are `apps/ui-docs/wrangler.jsonc`, `apps/ui-docs/public/_headers`, `apps/ui-docs/public/_redirects`, and `scripts/cloudflare-preview.mjs`. Reuse the same asset build and the same header and redirect files for production. Bind the exact custom domain ui.n3wth.com instead of a `*-pr-*.preview.n3wth.com` host. Skip the preview noindex injection.
- Give the production Worker its own name. The committed config in `apps/ui-docs/wrangler.jsonc` names the Worker `n3wth-ui-docs-preview`, sets `compatibility_date` 2026-09-18, disables `workers_dev` and `preview_urls`, and serves `./dist` with `html_handling` `drop-trailing-slash` and `not_found_handling` `404-page`.
- Check the `/docs` redirect status code before cutover. Vercel returns a 308 for the `permanent: true` rule in `apps/ui-docs/vercel.json`. The Cloudflare `_redirects` file declares 301. Decide which code production should return, then record the decision and the observed code.
- `environments.json` records no environment variables for the `ui` project.

### Garden

- Run this Next.js app on the OpenNext Cloudflare adapter. Preserve both redirects in `apps/garden/vercel.json`: `/home` to `/` as temporary, and `/atomic-notess` to `/atomic-notes` as permanent. Vercel returns 307 for the temporary rule and 308 for the permanent rule. Record the observed codes and keep the temporary rule temporary.
- Preserve `/random`, the file-backed notes, and OG font and asset generation. `cloudflare-migration.md` lists these in its Runtime design table. `satellites.md` lists them in its Garden section.
- `environments.json` records no environment variables for the `garden` project. Confirm this in the dashboard before cutover, because `environments.json` may not capture every scope.

### Kit

- Run this Next.js app on the OpenNext Cloudflare adapter. Keep the Stripe webhook URL unchanged. The Stripe dashboard holds a fixed callback against the current kit.n3wth.com hostname. A Workers Custom Domain keeps that hostname, so an exact domain match leaves the webhook destination intact.
- Confirm the webhook route path `/api/webhook` resolves identically under the Worker before you switch. Its source is `apps/kit/app/api/webhook/route.ts`.
- Preserve the route's failure behavior. The handler returns 400 when the `stripe-signature` header is missing, and 400 when `stripe.webhooks.constructEvent` rejects the signature.
- Secrets to set: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET. The handler reads both at runtime. `environments.json` lists neither, and it records no variables at all for the `kit` project. Confirm their current Vercel scopes before cutover. Scopes are unverified.
- `apps/kit/vercel.json` declares no redirects and no headers. Do not invent either during the port.

### Skills

- Run this Next.js app on the OpenNext Cloudflare adapter. The auth callback path is `/auth/callback`. Its handler is `apps/skills/app/auth/callback/route.ts`, and it builds its redirect from the incoming request URL origin. `apps/skills/src/components/AuthProvider.tsx` builds the sign-in redirect as `${window.location.origin}/auth/callback`. Neither file hardcodes a production origin. Add the production hostname skills.n3wth.com to the identity provider's allowed redirect list before cutover.
- Preserve the callback handler's behavior. It accepts only a relative `next` parameter, rejects values starting with `//` or `/@`, and falls back to `/`. On a failed exchange it redirects to `/?error=auth`.
- Preserve the CSP in `apps/skills/vercel.json`. Its `script-src` allows `'self'`, `'unsafe-inline'`, `plausible.io`, `elephant.n3wth.com`, and `www.googletagmanager.com`. Its `connect-src` allows `'self'`, `plausible.io`, `generativelanguage.googleapis.com`, `*.supabase.co`, `elephant.n3wth.com`, `www.google-analytics.com`, `region1.google-analytics.com`, and `www.googletagmanager.com`. The file also sets `frame-ancestors 'none'`, `cleanUrls`, `trailingSlash: false`, a temporary `/home` to `/` redirect, and the same five security headers used elsewhere.
- Treat the Supabase entry as legacy. `cloudflare-migration.md` records that no Supabase data needs preserving. Keep the entry until someone reviews the whole CSP against the auth and database backend that is live at cutover time. Removing an origin the app still calls breaks requests silently.
- Secrets: the full Postgres, Neon, Sentry, Axiom, and AI Gateway list in section 2. Do not set database secrets for a Cloudflare production Worker until the data decision gate in `cloudflare-migration.md` closes. That gate chooses D1 with Better Auth, or Neon as fallback. Hold the Skills hosting cutover until then. See section 1.

### r3-web

- Run this Next.js app on the OpenNext Cloudflare adapter. The function `allowedOrigin` in `apps/r3-web/worker/search.ts` defines the CORS allowlist for the search API. It already allows the production origin `https://r3.n3wth.com`, the Vercel preview pattern `https://r3-<slug>-n3wth.vercel.app`, and the local ports 4386 and 4286 on `127.0.0.1` and `localhost`. The production origin needs no change. Keep the Vercel preview pattern, because Vercel remains the rollback target.
- Note that `apps/r3-web/vercel.json` pins `regions` to `iad1`. Workers run at the edge instead. Watch for latency or data-locality assumptions that depend on a single region.
- Secrets: POSTHOG_PERSONAL_API_KEY, NEXT_PUBLIC_AXIOM_TOKEN, NEXT_PUBLIC_AXIOM_DATASET. All three carry production scope in `environments.json`. A `NEXT_PUBLIC_` variable is normally a build-time value baked into the client bundle. Confirm whether each one needs a Worker secret or only a build-time value.

## 4. Cutover steps per app, in order

These steps apply to one app. Do not start the next app until the current app passes verification, or until someone defers it on the record. Nothing in this section authorizes a switch. Section 6 governs that.

1. **Pre-checks**
   - Confirm the app's preview acceptance case in `cloudflare-migration.md`, under Acceptance cases, passed on the current main branch commit. Do not accept a result from an older branch.
   - Record the current DNS target and the Vercel production deployment ID from section 2. Confirm both still match the live dashboard.
   - Confirm the app's effective build and install commands. Read the committed `vercel.json`, not the dashboard fields alone.
   - Confirm the secrets listed in section 3 are ready to set. Hold every value outside this repository.
   - Obtain explicit per-app approval under section 6 before you go past this point.

2. **Deploy to a staging hostname first**
   - Deploy the production Worker build under a non-production hostname. Use `n3wth-<app>-staging.workers.dev`, or a dedicated `<app>-staging.preview.n3wth.com` custom domain.
   - Use the same Worker name and config the production cutover will use, minus the final custom domain binding.
   - Do not bind the exact production custom domain at this step.

3. **Verify on the staging hostname**
   - Run the full post-switch verification list below against the staging hostname.
   - Fix each failure and redeploy to the same staging hostname. Repeat until every check passes.

4. **Switch the exact custom domain**
   - Note that Cloudflare hosts the n3wth.com zone. Cloudflare provisions DNS for a Workers Custom Domain when someone adds the domain. Do not create a separate manual DNS record.
   - Remove or replace the existing record for the hostname first. Cloudflare does not create a conflicting record automatically. For every app except portfolio the existing record is a CNAME to a `*.vercel-dns-0*.com` target. See section 2 for each exact target.
   - Handle the portfolio apex separately. Its existing record is an A record at 216.150.1.1. An apex record cannot be a plain CNAME. Confirm whether Workers Custom Domains bind directly to a zone apex, or whether the zone needs a CNAME-flattening equivalent. Unverified: exact Cloudflare apex behavior for this zone.
   - Add the Workers Custom Domain for the exact production hostname. Point it at the new production Worker.

5. **Post-switch verification list**
   - HTTPS: confirm a valid certificate, no mixed-content warning, and no browser interstitial.
   - Redirects: check the exact status code for every rule, not only the final destination. Vercel returns 308 for a `permanent: true` rule and 307 for a `permanent: false` rule. Portfolio's `/frameworks`, `/blog`, `/news`, `/press` and their trailing-slash variants are permanent. Garden's `/home` is temporary. Garden's `/atomic-notess` is permanent. UI docs' `/docs` is permanent, and its Cloudflare `_redirects` file declares 301 where Vercel returns 308. Record the code each rule returns. Treat a temporary rule that becomes permanent, or the reverse, as a regression even when the final page loads.
   - Headers: compare the security headers X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, and Permissions-Policy against the recorded `vercel.json` values for that app. Compare the cache headers too: immutable on `/assets/*` and `/fonts/*`, must-revalidate elsewhere.
   - Assets and caching: confirm long-lived assets return the immutable cache-control header. Confirm a repeat fetch returns 304 or a fresh 200, not an unexpected cache miss on every request.
   - API responses: check portfolio `/api/agent`, `/api/search`, and `/api/github-stats`. Check kit `/api/webhook`, and confirm it still returns 400 for a missing `stripe-signature` header and 400 for an invalid signature. Do not send a live Stripe event against production. Use a Stripe signed test event replay or a staging webhook endpoint. Check the r3 search Worker CORS response headers from the production origin.
   - Auth flow: run this check for skills only after the data migration gate closes. Run a full magic-link login and a session check against the production hostname before you call skills done.
   - Robots, sitemap, canonical: confirm no production response carries an `X-Robots-Tag: noindex` header. Confirm `robots.txt` and `sitemap.xml` resolve where present, and that they list the production hostname. Confirm canonical URLs in page metadata point at the production origin recorded in `packages/site-config/index.js`, not at a staging or preview host.
   - OG images: fetch each app's Open Graph image route directly. Confirm it renders at the production hostname. `cloudflare-migration.md` lists OG generation as a preservation requirement for garden, kit, and r3.

6. **Evidence to record**
   - Record the app name, the date and time of the switch, and the approver. See section 6.
   - Record the old and the new DNS or custom-domain configuration, with exact hostnames.
   - Record the production Worker name and the commit SHA it was built from.
   - Record the result of each item in the post-switch verification list. Include response codes and header values, not a bare pass or fail.
   - Record the previous Vercel production deployment ID. Confirm it is still promotable for rollback.

## 5. Rollback per app

1. Point the hostname back at Vercel. Remove the Workers Custom Domain. Restore the CNAME recorded in section 2, or the A record for portfolio.
2. Promote the Vercel production deployment ID recorded for that app in section 2. Promote the most recent known-good deployment instead if a newer safe deployment exists. Follow the rollback procedure in `docs/workspace/deployment.md`: "For rollback, restore the previous successful Production deployment for only the affected project."
3. Do not change Vercel project settings during this rollback. That covers root, build and install commands, environment variables, and framework preset. Leave them untouched until N-717, "Retire redundant builds and verify realized hosting savings", closes, and until someone separately approves any cleanup from it.
4. Record the rollback the way you record a cutover. Record the app, the time, the approver, and the verification that the restored Vercel deployment serves correctly.

## 6. Approval rule

Every production switch in section 4 needs explicit approval from Oliver. Obtain that approval per app, before you switch that app's custom domain. Nothing in this document is that approval. A passed preview acceptance case does not authorize a switch. A passed staging verification does not authorize a switch. The existence of this runbook does not authorize a switch. This runbook records no completed switch and no granted approval.
