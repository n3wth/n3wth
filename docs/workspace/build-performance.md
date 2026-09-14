# Build performance

Measured against main at `03accd9` on September 14, 2026, using Node 24.20.0 and npm 11.19.1.

## Scope and measurements

The supplied portfolio Vercel log spends approximately 28 seconds installing dependencies and 30 seconds running the dependency-aware build. UI transforms 2,245 modules before portfolio transforms 2,879 modules. The optimization target is less repeated work without skipping type validation, declarations, styles, metadata, or app prerequisites.

Local measurements use `time npm run build:portfolio` after a root `npm ci`, on the same checkout and machine. They exclude installation and deployment. Each result is one observation, not a statistical estimate of Vercel performance.

| Variant | Portfolio build including UI | UI modules |
| --- | ---: | ---: |
| Main baseline | 13.746 seconds | 2,245 |
| External ordinary dependencies, disable library gzip reporting | 12.221 seconds | 570 |
| Also reuse declaration generation for type validation | 11.379 seconds | 570 |

A follow-up comparison cleared both portfolio TypeScript build-info files before each build and used the same installed dependencies. Main took 13.896 seconds; the optimized build took 10.740 seconds, a 22.7% reduction. These single-run observations are directional evidence. Vercel timing remains unmeasured until an authorized deployment.

## Changes

- Keep `clsx`, `tailwind-merge`, and `iconoir-react` external in the UI library. They are declared runtime dependencies and consumers bundle them. Astryx stays bundled so JSX development calls are normalized by the shared package.
- Reuse vite-plugin-dts's semantic, syntactic, and declaration diagnostics instead of starting a separate `tsc` process. Its diagnostic callback throws on errors, so failed validation cannot produce a successful build.
- Check that every public JavaScript entry and declaration exists in the built package.
- Skip gzip-size reporting for the intermediate library output.
- Use pinned npm 11.19.1 `install --prefer-offline` for portfolio deployments so restored dependencies are reused. Verify the lockfile resolution is unchanged and retain its original bytes; discard only npm's extraneous installed-package inventory. CI continues to use `npm ci`. Five stale workspace dependency specifiers in the lockfile were normalized to their existing manifests; no resolved package versions changed.
- Opt portfolio into a verified UI artifact cache under `node_modules/.cache/n3wth-ui-build`. Source, dependency, configuration, environment, and runtime changes invalidate it. All cached file contents are checked before restoration. The app itself always builds. [Vercel's static builder](https://github.com/vercel/vercel/blob/main/packages/static-build/src/index.ts) caches dependency directories from the repository root; [its default cache glob](https://github.com/vercel/vercel/blob/main/packages/build-utils/src/default-cache-path-glob.ts) includes this location.

## Cached deployment path

After catching up to `d386c8f`, a local incremental install took 2.484 seconds. The first `npm run build:portfolio -- --cache-ui` took 14.242 seconds and populated the UI cache. The following build restored UI and took 8.058 seconds. These measurements were sequential, with no concurrent validation jobs, and include portfolio data refresh and metadata generation. The combined warm install/build observation is approximately 10.5 seconds; it excludes Vercel provisioning, function packaging, upload, and deployment. A cold dependency install still needs build and validation tooling, and a changed lockfile or UI source still requires a UI build.

A separate fresh checkout passed both install/build cycles: the cold install added 1,101 packages and the first build populated the UI cache; the next install reported up to date in one second and the next build restored verified UI output. Cache tests cover source additions/deletions, configuration and lockfile changes, runtime/environment changes, app-only edits, corrupt output, replacement of stale output, and default builds bypassing the cache.

All six apps consume UI. The full root `npm run check` passed, including all six builds, UI's 415 tests, package export checks, design invariants, and built metadata. An injected TypeScript assignment error correctly failed the UI build; the temporary probe was removed. The first check encountered stale Kit `.next/types` referencing a removed route; moving the generated cache aside resolved it without source changes. Manual-only deployment policy remains in place.

The existing browser suite passed 83 checks with one skipped, covering portfolio, UI docs, and Kit at 390, 852, and 1440 pixels, including theme and navigation checks. The npm bootstrap's inherited `npm_config_call` and `npm_config_package` variables were unset for this run to allow the suite's nested `npm exec` server commands.

Final validation after the cache/install changes: a fresh root `npm ci`, full `npm run check`, and browser suites passed (83 portfolio/UI docs/Kit checks, 16 Garden checks, and 33 r3 checks; one existing skip). Locked package versions, resolved locations, and integrity hashes were verified unchanged.

## Dependency cleanup

The follow-up cleanup removes 14 unused UI devDependency declarations, including docs tooling now owned by UI docs. Portfolio no longer declares its unused PostHog Rollup plugin or StyleX package. Manual image/font tools are owned by root devDependencies, and portfolio's deployment install explicitly excludes root dependencies. Existing asset-generation commands continue to work after a full root install.

A fresh filtered install now adds 873 packages versus 1,101 before: 228 fewer (20.7%). Both cold and warm portfolio builds passed. The fresh deployment tree contains no Playwright, opentype.js, wawoff2, sharp, satori, resvg, or PostHog build CLI. No retained lockfile package versions changed. This count reduction is not a measured Vercel time reduction.

An incremental install over an older restored cache can retain tools belonging to unselected workspaces. Clear the Vercel build cache once on the next authorized deployment to get the lean dependency tree; normal subsequent deployments can reuse that cache. No deployment or cache reset is performed by this source change.

Cleanup validation passed: fresh root `npm ci`, full `npm run check`, 132 browser checks with one existing skip, and the non-writing portfolio `og:cards -- --check` command. The asset command reported small pixel differences against the committed images (0.08%) but generated no files; this cleanup changes no image-generation code or assets.
