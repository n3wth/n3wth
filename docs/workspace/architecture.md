# Personal sites workspace decision

Status: pilot implementation decision. Production cutover follows separate validation.

## Source and package manager

Use the existing n3wth/n3wth repository. Retain its history and import the UI library/demo from a recorded n3wth/ui main revision. Keep the source repository and its public package release process active until publishing migration is explicitly validated. Use npm workspaces and Node 24, matching the maintenance baseline. One root lockfile owns the pilot dependency graph; do not introduce another build orchestrator yet.

## Boundaries

- apps/portfolio: existing portfolio application, API functions, public assets and app-specific configs. Name @n3wth/portfolio.
- apps/ui-docs: UI documentation/demo and its assets and Vite config. Name @n3wth/ui-docs.
- packages/ui: existing public @n3wth/ui library, version 0.9.2. Preserve exports and public fonts. No visual redesign or component API upgrade.
- packages/site-config: private @n3wth/site-config package containing canonical public origins only. No environment values, app behavior or framework dependency.
- Root: lockfile, workspace commands, affected-app CI and maintenance documentation.

Applications can depend on shared packages. Shared packages must not depend on applications. Portfolio only consumes site-config initially; it has no current UI dependency and must retain its custom scene/navigation. UI docs consumes UI and site-config through package imports. Build UI before docs; watch its build during docs development. Resolve dependency asset paths through package resolution so npm hoisting is supported.

## Preservation

Move portfolio files without changing public content, routes, metadata, redirects or assets. Keep the original work/n3wth feature/contact-form checkout untouched. Reapply that unfinished work separately against moved paths. Import UI with a source revision manifest and retain the original repository history externally; do not pretend a snapshot import contains all UI history. Public npm publishing stays with n3wth/ui during the pilot, avoiding two release authorities.

## Deployment

Retain the two Vercel project identities and domains. Stage independent previews before switching root directories to apps/portfolio and apps/ui-docs. Each build runs from the root workspace lockfile. Shared changes rebuild consumers. Preserve portfolio API functions and rewrite/header rules. Production rollback includes the old deployment plus prior root/build/install settings. Do not archive old repositories or switch UI package publishing during the pilot.

## Validation and rollout

Inventory -> boundaries -> workspace pilot -> deployment previews and affected checks in parallel -> production pilot -> individual later migrations -> shared cleanup.

Run existing app/library checks with clean npm ci. Verify package exports using npm pack --dry-run and the docs build as a consumer. Add dependency-selection tests and browser checks for routes, overflow and representative responsive pages. Avoid animation pixel equality. Preserve current framework versions by seeding the workspace lock with current locks and review resolved-version drift before accepting it.

Garden, Skills, Kit and r3 website remain independent until the pilot is accepted. The r3 core runtime and failing memory tests remain separate. No domain consolidation or framework rewrite is needed to prove the workspace.

## Validated dependency adjustment

The original portfolio lock resolved React and React DOM 19.2.3 while UI resolved 19.2.7. Combining both initially produced invalid hook calls through a shared testing library. Align the pilot on UI's existing 19.2.7 patch and retain Vite 7.3.5 and TypeScript 5.9.3. This is a scoped React patch alignment, not a framework major upgrade; verify both applications and library tests on the resulting lockfile.

Generate the combined lock with npm 11.19.1. npm 10.9.8 failed in Arborist peer resolution and did not produce a valid combined tree. The regenerated lock preserves the source direct dependency versions (apart from the explicit React patch alignment); transitive dependencies resolve normally. CI and Vercel installs use the pinned npm version.
