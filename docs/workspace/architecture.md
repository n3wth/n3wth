# Workspace architecture

The content site is `n3wth.com`, including documentation at `/docs`. `apps/portfolio` uses Astro for static pages, Starlight for documentation, and React islands for existing interactive experiences. Its Cloudflare Worker owns the retained APIs and serves built assets.

## Ownership

- `apps/portfolio`: portfolio, articles, project pages, docs, assets, and public APIs. Docs content lives under `src/content/docs/docs`.
- `apps/garden`: compatibility redirects for old Garden URLs. Published article content belongs to portfolio.
- `apps/r3` and `apps/ui`: local redirect contract fixtures. Live site redirects are Cloudflare zone rules. The independent r3 search service remains separate until its consumers are verified retired.
- `apps/skills`: static legacy installer and raw skill downloads only. It has no package manifest or application runtime.
- `packages/ui`: public `@n3wth/ui` library. This repository remains its npm publishing authority through `publish-ui.yml` and `ui-v*` tags.
- `packages/site-config`: public origins and shared contracts without app dependencies or secrets.
- `docs/workspace`: repository operations and maintenance documentation, not a separate website.

Applications may depend on shared packages. Packages must not depend on applications. The root npm lockfile owns dependencies. Node 24 and npm 11.19.1 are required. The dependency-aware build script builds packages before consumers once per run.

## Retirements

Skills accounts, comments, voting, analytics, playground and catalog UI are retired. Existing raw GitHub downloads must remain available while published installer copies reference their paths. D1 data and prior Worker versions are preserved outside source preparation for rollback; deleting source does not authorize deleting stored user data.

Mintlify is replaced by Starlight in the source architecture. Production DNS, redirects and integration disconnection are a separate verified cutover. Vercel remains disconnected and is not a deployment target.

The public r3 runtime remains in `n3wth/r3`; website changes do not publish that package. See [deployment](deployment.md), [maintenance](maintenance.md), and [UI release](npm-release.md).
