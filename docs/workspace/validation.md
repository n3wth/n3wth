# Pilot validation

Validated locally on Node 24.20.0 with npm 11.19.1 on 2026-09-06.

- Clean root npm ci passed.
- Dependency tree has no missing or invalid dependencies.
- Root affected-workspace and deployment selection: 16 tests passed, including transitive consumers, package-only changes, app-only changes, deleted manifests and safe build fallback.
- Portfolio: lint, 43 tests and production build passed.
- UI library: lint (one existing unused-variable warning), 376 tests and production build passed.
- UI docs: production build and its existing navigation test passed.
- Browser: 24 checks passed at 390, 852 and 1440px widths. Covers six portfolio routes, settled home scene labels, navigation, runtime errors, page overflow and UI docs navigation. Reduced motion is enabled. Screenshots were inspected for the mobile home and component catalog.
- Public UI package pack dry-run: seven declared export targets and 13 font files present. Version remains 0.9.2.
- Source direct dependency versions retained except portfolio React/React DOM 19.2.3 to 19.2.7, aligning with UI. Shared React avoids invalid hook calls. Vite remains 7.3.5 and TypeScript 5.9.3.

The browser check found a pre-existing nowrap footer overflow at 390px in UI. Adding flex-wrap fixes it without clipping content. The split docs app now displays the library version instead of its private application version.

GitHub-hosted lint, tests, builds and all 24 browser checks passed on PR #149. Both final Vercel previews built successfully with app roots and the root lockfile. Remote browser checks at 390 and 1440px passed without horizontal overflow or JavaScript errors. UI version 0.9.2, fonts and registry JSON were verified. Portfolio GET /api/search returned the expected 405 JSON response without calling upstream search.

PR #149 merged as 98e871cc6b20e78b772eed32d39ded5357f33772. Both automatic production deployments reached READY and received their existing public domains. See deployment.md for deployment IDs and rollback settings. Original contact-form work remains untouched in its original checkout. An actual production rollback has not been performed.
