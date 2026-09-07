# Skills migration preparation

Source: `n3wth/skills` main `138c6ff16cb49d2e73c29c7e4faeaeced946ba2e`.
Destination: `apps/skills`, workspace `@n3wth/skills`.

This branch prepares source only. The existing Skills Vercel project and production domain are unchanged. Deploy after the portfolio/UI pilot is accepted, with a verified preview and rollback to the original repository/root.

## Preserved boundaries

Application routes, API handlers, proxy/auth behavior, Supabase migrations, public assets, skill content, and the legacy Vite surface are copied without application changes. CLI and editor extension remain in the original Skills repository, including their release and install-script workflows. Public repository/raw-content links retain their original destinations.

Direct dependency versions are pinned to the source lockfile versions except Vite, aligned from 7.3.1 to the workspace's 7.3.5 to keep plugin types compatible after hoisting. Skills continues consuming published `@n3wth/ui@0.6.1`; the workspace UI library remains `0.9.2`. No UI version migration is included. The affected-workspace graph currently identifies dependencies by package name, so workspace UI edits conservatively also check Skills. That extra validation is safe but unnecessary until the resolver distinguishes registry dependencies from local packages.

The application install hook is removed because Husky must not modify the enclosing workspace repository during installation. The source app did not track Husky hook files. Existing app lint/typecheck/unit/build commands remain the required check.

## Commands

Run Node 24 and npm 11.19.1 from the workspace root:

```sh
npm ci
npm run dev:skills
npm run check -w @n3wth/skills
npm run build:skills
```

The single root lockfile governs all apps. Next's tracing and Turbopack roots point to the workspace root. App public/source paths remain app-relative.

## Deployment validation

Keep `skills.n3wth.com` on the existing Vercel project. Proposed root directory: `apps/skills`, with files outside the root included. The checked-in install command runs root `npm ci` with pinned npm. The affected-app ignore command fails open to building if the prior deployment SHA is absent or unresolved.

Preserve all existing project environment variables and scopes. Do not copy secret values into the repository. Verify configured Supabase login/callback and authenticated features against a preview before cutover. Local checks without these variables only verify the existing unconfigured fallback.

Before production, verify `/`, skill detail routes, catalog filtering, sign-in controls, auth callback behavior, public install/download assets, anonymous/read-only behavior, and API responses. Do not submit live votes or create accounts as a smoke test.

React and React DOM are aligned from 19.2.4 to workspace 19.2.7 because hoisted animation/testing dependencies otherwise load a second React instance. Next remains 16.1.6. Run `npm run test:migration -w @n3wth/skills` after building for read-only route, callback and installer checks at three viewport widths.

## Local evidence

Clean Node 24/npm 11.19.1 `npm ci` passes. Skills typecheck, lint, all 283 unit tests and production build pass. Production-server migration tests cover four routes, missing-code auth redirect and installer availability at 390, 852 and 1440 pixels. Existing portfolio/UI checks also pass against the expanded dependency installation. Application source, proxy, API handlers, public assets and Supabase files are byte-identical to the source commit.
