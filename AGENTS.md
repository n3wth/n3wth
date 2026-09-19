# Workspace

Before UI changes, read [design.md](design.md) and [style.md](style.md). They define the shared design and implementation rules across all apps. Update these documents when an accepted pattern changes; do not maintain competing versions for one app.

Use Node 24 and npm 11.19.1, then run npm ci at the repository root. npm 10 has a peer resolution failure on this workspace. The root package-lock.json is the only application/library lockfile. Use feature branches. Other agents often have uncommitted work in the primary checkout, so work in a separate git worktree and commit only the files you changed.

- apps/portfolio: n3wth.com. Read its AGENTS.md before editing.
- apps/ui-docs: ui.n3wth.com documentation app.
- apps/skills: skills.n3wth.com. Read its AGENTS.md before editing. It consumes the workspace UI package alongside the other sites.
- apps/kit, apps/garden, apps/r3-web: other consumers of the shared system. Read their AGENTS.md before editing.
- packages/ui: public @n3wth/ui library. Read its AGENTS.md before editing.
- packages/site-config: canonical public origins, with no framework dependency or secrets.

Applications may import shared packages. Packages must not import applications. Preserve UI package exports.

All site foundations come from `@n3wth/ui/site` and `@n3wth/ui/site.css`. Use `npm run site:new -- idea-name "Idea name"` for new sites; read `docs/workspace/design-system.md`. Keep themes and typography in the shared package rather than copying them into applications.

Sites must import native controls through `@n3wth/ui/primitives` and Tailwind tokens through `@n3wth/ui/tailwind-theme.css`. Only packages/ui may depend on or import Astryx. Keep dependency upgrades and runtime integration in UI; do not add JSX runtime shims in applications. `check:design` enforces the import/dependency boundary.

Commands: npm run dev, npm run dev:ui, npm run build, npm run build:portfolio and npm run check. The root build and builds that target one app use scripts/build.mjs so shared packages build before consumers and only once per run. CI uses scripts/affected.mjs to check changed workspaces and their consumers in dependency order. Build packages before their apps. Run browser checks when changing routes, layout or packaging.

For shared changes, identify affected consumers and verify them at mobile and desktop widths. Check both themes where supported, initial theme paint, scroll reset on page navigation, anchor links, browser Back, code overflow and footer consistency. Preserve useful product actions; remove redundant navigation only where appropriate. Keep public metadata and sitemaps correct. Never report production complete from a local build alone.

Do not redesign the portfolio scene/navigation or upgrade frameworks as part of migration. Preserve routes, redirects, metadata, assets and API behavior. The original feature/contact-form checkout contains unfinished work and must not be reset.

Deployment cutover and rollback are separate from source preparation. See docs/workspace/architecture.md and the Linear Personal sites workspace project. Keep existing projects and domains and verify previews before any production root changes.

## Shared UI

- Every app depends on `@n3wth/ui` with the specifier `"*"`. npm links `packages/ui`, so all six sites run the same UI code. Do not pin a version in an app.
- Change shared UI in `packages/ui`. CI checks every consumer through `scripts/affected.mjs`.
- Changesets is not used. Do not add `.changeset` files.
- To publish to npm: in one PR, bump `version` in `packages/ui/package.json`, set the same version in `packages/ui/v0/n3wth-ui/assets/starter/package.json`, and add an entry to `packages/ui/CHANGELOG.md`. Merge it. Push the tag `v<version>`. `publish-ui.yml` runs the package checks and publishes. Never run `npm publish` locally. See docs/workspace/npm-release.md.
- Publishing does not deploy a site. Deploying a site does not need a publish.

## Deployment

Cloudflare builds use `npm run build:cloudflare`, with optional repeated
`--workspace @n3wth/<app>` arguments. This reuses the build script that
follows the dependency order. Each app's `wrangler.jsonc` targets production; preview configs are
generated with isolated identities and bindings. Do not copy generated OpenNext
output between build environments. See the deployment runbook before deploying.

All six sites use Cloudflare. Keep `git.deploymentEnabled: false` in every app's vercel.json and the site generator. Keep the six Vercel projects disconnected from GitHub so pushes and pull requests do not create Vercel deployments or status checks. Preserve their deployment history for an explicit rollback; do not reconnect Git as part of normal work.

Keep GitHub CI and Cloudflare workflows enabled and wait for passing checks before merging. The current branch ruleset does not require CI or pull requests. Verify the target environment, successful deployment, and live behavior before reporting a release complete. Follow [the deployment runbook](docs/workspace/deployment.md), including its rollback guidance.
