# Skills migration preparation

Source: `n3wth/skills` main `138c6ff16cb49d2e73c29c7e4faeaeced946ba2e`.
Destination: `apps/skills`, workspace `@n3wth/skills`.

This branch prepares source only. The existing Skills Vercel project and production domain are unchanged. Deploy after the portfolio/UI pilot is accepted, with a verified preview and rollback to the original repository/root.

## Preserved boundaries

Application routes, API handlers, proxy/auth behavior, Supabase migrations, skill content, and the legacy Vite surface are preserved. CLI and editor extension remain in the original Skills repository, including their release and install-script workflows. Public repository/raw-content links retain their original destinations.

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

Clean Node 24/npm 11.19.1 `npm ci` passes. Skills typecheck, lint, unit tests and production build pass. Production-server migration tests cover four routes, missing-code auth redirect and installer availability at 390, 852 and 1440 pixels. Existing portfolio/UI checks also pass against the expanded dependency installation. API handlers, proxy and Supabase files remain byte-identical to the source commit.

## Existing hosted defects addressed during preview validation

The initial preview and original production both returned the vote handler's `skillId required` response for `/auth/callback` and `/api/health/supabase`. Vercel had assigned those handlers the same 113 KB bundle as `/api/vote`; the source contains both legacy and Next vote handlers. An identical-source preview with `NEXT_EXPERIMENTAL_FUNCTION_BUNDLING=1` routes auth and health through the full Next dispatcher, restoring callback 307 and health's explicit unconfigured 503. The flag is scoped to this app's build configuration. Preview Supabase variables are absent, so authenticated login remains unverified.

The daily card now uses a stable initial state before computing the visitor's day after hydration. This fixes an existing hydration mismatch when the static build date/timezone differs from the visitor's. A server-render/hydration regression test covers different dates.

UI 0.6.1 references Mona Sans fonts that were missing in Skills. Both variable font assets are copied unchanged from the existing UI docs workspace. Embedded font metadata identifies the Mona Sans Project Authors and SIL Open Font License 1.1; the upstream `github/mona-sans` OFL is included beside the fonts. No font styling or design tokens are changed.
