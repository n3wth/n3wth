# Workspace deployment

## Build and preview

Use Node 24 and npm 11.19.1, then `npm ci` at the repository root.

```bash
npm run build:cloudflare
npm run build:cloudflare -- --workspace @n3wth/portfolio
npm exec -- wrangler deploy --config apps/portfolio/wrangler.jsonc --dry-run
```

The dependency-aware build script builds shared packages once before consumers. Astro builds portfolio and Starlight documentation into `apps/portfolio/dist`. The portfolio Worker serves those assets and retained APIs. Garden remains a small redirect Worker. UI and r3 are local redirect fixtures; their public domains use Cloudflare zone rules and must not be replaced with new Workers.

`scripts/cloudflare/deploy-apps.mjs` owns the active deployment inventory. Skills is excluded. Historical preview identities remain supported only so old previews can be cleaned up.

Each active app's `wrangler.jsonc` is a production configuration. Preview tooling generates a configuration under `.cloudflare/`, replaces Worker names and domains, wraps responses with `X-Robots-Tag: noindex, nofollow`, and refuses inherited production stateful bindings. Secrets remain outside source. Never deploy a preview config to production or attach a preview to production data.

Preview overrides for D1, KV, R2 and Vectorize must use explicit identifiers that differ from every resource declared in the source config. This check does not establish ownership or prove a resource is unique to a PR; verify that separately before providing an override. AI Search, Durable Objects, Queues, Hyperdrive and mTLS bindings are rejected until their isolation can be verified.

Newsletter signup is disabled in previews. Portfolio preview uploads replace any retained Resend API key with an invalid value; the production key is not supplied to preview workflows. Existing previews retain their old bindings until redeployed or removed, and prior Worker versions may retain secrets. Audit those previews and rotate the production key if exposure is suspected. This does not isolate other retained secrets or make same-repository PR code untrusted-safe.

Automatically generated preview rate-limit IDs use a 32-bit hash and can collide between PRs or with resources outside the source configuration. They are not proof of account-wide isolation; verify namespace ownership before relying on it. Unsupported data-access and side-effect bindings fail closed, and source event triggers are removed from previews.

The preview readiness gate checks DNS, TLS, HTTP behavior and noindex without disabling certificate verification. Verify responsive pages, docs navigation/search, old aliases, images, and retained APIs before merging. Wait for passing Site CI and preview checks.

Production runs only from main. Each run validates and deploys both active Workers, including on docs-only pushes, so the next successful run reconciles changes from a missed or partially failed release. Full repository, package, editorial and browser checks block deployment on failure. Immediately before deploying, the workflow rejects a SHA that is no longer current main. This check is point-in-time: main can advance while deployment is underway.

The deployment queue holds at most 100 pending runs and does not guarantee dispatch order. After a failure, cancellation, or queue overflow, dispatch the workflow on current main and verify the live Workers. Re-running a historical workflow uses its historical rules, which may not reject an old SHA. Portfolio and Garden deploy separately; if a release fails between them, inspect both live Workers and retry or roll back as needed. GitHub's Resend secrets are published with the portfolio version, so keep them synchronized with any manual rotation.

## One-site cutover

Source preparation is not a production release. Before changes, export Worker versions, DNS records and complete redirect rulesets. Retain the existing integrations until the replacement is verified.

1. Deploy the Astro site to the existing `n3wth-portfolio` Worker. Verify `/docs` and every migrated documentation path, metadata, search and assets on `n3wth.com`.
2. Redirect `docs.n3wth.com/<path>` to `n3wth.com/docs/<path>`, preserving query parameters. The existing docs CNAME points to `cname.mintlify.builders` with proxy disabled. Zone redirect rules require proxying that record; DNS-only traffic bypasses them. Preserve its original configuration for rollback.
3. Point existing r3/UI documentation redirects directly at `n3wth.com/docs` once those paths are verified. Preserve their status codes, explicit legacy aliases and query strings.
4. Redirect legacy Skills pages to the appropriate remaining project/documentation destination. Preserve `/install.sh` as a redirect to the actual shell file. Raw GitHub downloads under `apps/skills/skills` remain stable. Retired API operations must fail explicitly rather than redirect writes to HTML.
5. Verify the live routes before disconnecting Mintlify's repository integration or detaching the retired Skills Worker. Do not delete its D1 database during cutover.

The Skills D1 database is `n3wth-skills` (`2f4ee3ca-a435-4b70-b621-4d2ad9192176`). Before retirement, export it into a restricted directory outside the repository and verify restoration, integrity, table counts and an export checksum. It contains authentication and user data. Preserve the database, Worker secrets and previous deployment until rollback is no longer needed.

## Rollback

Restore the saved portfolio Worker version if the new site fails. For docs, disable the new redirect and restore the original DNS-only Mintlify CNAME; restore the prior r3/UI redirect targets. Keep Mintlify configured during the initial verification window so this remains possible.

For Skills, remove the retirement redirect and restore its prior Worker/domain binding. Preserve D1 rather than recreating it. Restoring a Worker version does not roll back database contents.

Garden redirects depend on published portfolio routes. Verify portfolio article destinations before deploying a changed Garden map. Roll back Garden first if its redirects fail, then restore the portfolio release if needed.

The production workflow records prior Worker versions as a rollback artifact. Inspect the exact account, domain, Worker and config before deployment. After release, verify the successful workflow and live HTTP/browser behavior. Do not report production complete from a local build or dry run.

## Retired providers

Vercel remains disconnected from GitHub and is not a deployment target. Historical project and deployment records are reference material, not a rollback procedure for the current architecture. Do not reconnect Vercel as part of normal work.

GitHub deployment metadata cleanup does not delete hosting resources. Keep current production and rollback records when removing stale integration or closed-PR preview entries.
