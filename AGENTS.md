# Personal sites workspace

Before UI changes, read [design.md](design.md) and [style.md](style.md). They define the shared design and implementation rules across all apps. Update these documents when an accepted pattern changes; do not maintain competing app-specific versions.

Use Node 24 and npm 11.19.1, then run npm ci at the repository root. npm 10 has a peer-resolution failure on this workspace. The root package-lock.json is the only application/library lockfile. Use feature branches.

- apps/portfolio: n3wth.com. Read its AGENTS.md before editing.
- apps/ui-docs: ui.n3wth.com documentation app.
- apps/skills: skills.n3wth.com. Read its AGENTS.md before editing. It consumes the workspace UI package alongside the other sites.
- apps/kit, apps/garden, apps/r3-web: other shared-system consumers. Read their AGENTS.md before editing.
- packages/ui: public @n3wth/ui library. Read its AGENTS.md before editing.
- packages/site-config: canonical public origins, with no framework dependency or secrets.

Applications may import shared packages. Packages must not import applications. Preserve the UI package exports and version; publishing remains in n3wth/ui during the pilot.

All site foundations come from `@n3wth/ui/site` and `@n3wth/ui/site.css`. Keep UI versions aligned so npm resolves the workspace, not a nested registry copy. Use `npm run site:new -- idea-name "Idea name"` for new sites; read `docs/workspace/design-system.md`. Keep themes and typography in the shared package rather than copying them into applications.

Sites must import native controls through `@n3wth/ui/primitives` and Tailwind tokens through `@n3wth/ui/tailwind-theme.css`. Only packages/ui may depend on or import Astryx. Keep dependency upgrades and runtime integration in UI; do not add application JSX-runtime shims. `check:design` enforces the import/dependency boundary.

Commands: npm run dev, npm run dev:ui, npm run build, npm run build:portfolio and npm run check. Root and app-targeted builds use scripts/build.mjs so shared packages build before consumers and only once per run. CI uses scripts/affected.mjs to check changed workspaces and their consumers in dependency order. Build packages before their apps. Run browser checks when changing routes, layout or packaging.

For shared changes, identify affected consumers and verify them at mobile and desktop widths. Check both themes where supported, initial theme paint, scroll reset on page navigation, anchor links, browser Back, code overflow and footer consistency. Preserve useful product actions; remove redundant navigation only where appropriate. Keep public metadata and sitemaps correct. Never report production complete from a local build alone.

Do not redesign the portfolio scene/navigation or upgrade frameworks as part of migration. Preserve routes, redirects, metadata, assets and API behavior. The original feature/contact-form checkout contains unfinished work and must not be reset.

Deployment cutover and rollback are separate from source preparation. See docs/workspace/architecture.md and the Linear Personal sites workspace project. Keep existing projects and domains and verify previews before any production root changes.

## Deployment policy

All six Vercel sites are manual-only, including main. Preserve `git.deploymentEnabled: false` in every app's vercel.json and the site generator. A commit, push, PR, or merge is not a release request. Do not deploy, promote, or enable automatic deployments unless the user requests a release or a deployment-policy change.

Keep GitHub CI enabled. For an authorized release, use the exact tested commit SHA and deploy only the requested affected projects; include shared-package consumers when relevant. Verify the target environment, successful deployment, and live behavior before reporting a release complete. Follow [the deployment runbook](docs/workspace/deployment.md), including its older-branch and rollback guidance. Keep native Vercel unaffected-project skipping enabled as a secondary cost control; it does not authorize a release.
