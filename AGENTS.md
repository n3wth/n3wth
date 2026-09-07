# Personal sites workspace

Use Node 24 and npm 11.19.1, then run npm ci at the repository root. npm 10 has a peer-resolution failure on this workspace. The root package-lock.json is the only application/library lockfile. Use feature branches.

- apps/portfolio: n3wth.com. Read its AGENTS.md before editing.
- apps/ui-docs: ui.n3wth.com documentation app.
- packages/ui: public @n3wth/ui library. Read its AGENTS.md before editing.
- packages/site-config: canonical public origins, with no framework dependency or secrets.

Applications may import shared packages. Packages must not import applications. Preserve the UI package exports and version; publishing remains in n3wth/ui during the pilot.

Commands: npm run dev, npm run dev:ui, npm run build:portfolio, npm run build:ui and npm run check. CI uses scripts/affected.mjs to check changed workspaces and their consumers in dependency order. Build packages before their apps. Run browser checks when changing routes, layout or packaging.

Do not redesign the portfolio scene/navigation or upgrade frameworks as part of migration. Preserve routes, redirects, metadata, assets and API behavior. The original feature/contact-form checkout contains unfinished work and must not be reset.

Deployment cutover and rollback are separate from source preparation. See docs/workspace/architecture.md and the Linear Personal sites workspace project. Keep existing projects and domains and verify previews before any production root changes.
