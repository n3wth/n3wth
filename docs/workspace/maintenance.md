# Workspace maintenance

## Sources of truth

| Responsibility | Source |
| --- | --- |
| Portfolio and documentation website | `apps/portfolio` |
| Published docs pages | `apps/portfolio/src/content/docs/docs` |
| Published articles | `apps/portfolio/content` |
| Public UI library and npm releases | `packages/ui`, `publish-ui.yml` |
| Canonical public origins | `packages/site-config` |
| Installed dependencies | Root `package-lock.json` |
| Legacy download compatibility | `apps/skills/skills`, `apps/portfolio/public/skills/install.sh` |
| Garden compatibility redirects | `apps/garden` |
| Retired UI/r3 URL contracts | `apps/ui`, `apps/r3`; production zone rules |
| r3 runtime releases | Separate `n3wth/r3` repository |

Use Node 24 and npm 11.19.1, then `npm ci` at the repository root. `npm run dev` runs the Astro site and Starlight docs together. `npm run check` validates workspace builds and tests. Run the affected browser checks after building. Use `npm run check:package` when changing the public UI package.

Astro owns page generation; React islands retain interactions where needed. Documentation is static Starlight content with local search. Avoid introducing a second site runtime or a separate docs deployment.

Root development dependencies own browser and asset tools. Keep one root lockfile. Do not run parallel browser suites into the same report directory. CI and local builds do not prove delivery, live DNS routing, or third-party integrations; verify these after release.

## Retirement safeguards

Keep legacy download paths stable while installed scripts reference them. Do not restore Skills account or catalog features. Database exports belong in a restricted directory outside the repository, with a restore check and row-count manifest. Never commit user records or authentication material.

Keep live resources until the replacement is verified. Source removal, provider disconnection, DNS cutover and stored-data deletion are different operations. Preserve rollback versions and routing configuration before cutover. Follow [deployment](deployment.md).

The monorepo continues to publish `@n3wth/ui`; site consolidation does not retire that package or its release workflow.
