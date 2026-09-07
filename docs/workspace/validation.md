# Pilot validation

Validated locally on Node 24.20.0 with npm 11.19.1 on 2026-09-06.

- Clean root npm ci passed.
- Dependency tree has no missing or invalid dependencies.
- Root affected-workspace selection: 9 tests passed, including transitive consumers, package-only changes, app-only changes and deleted manifests.
- Portfolio: lint, 43 tests and production build passed.
- UI library: lint (one existing unused-variable warning), 376 tests and production build passed.
- UI docs: production build and its existing navigation test passed.
- Browser: 24 checks passed at 390, 852 and 1440px widths. Covers six portfolio routes, settled home scene labels, navigation, runtime errors, page overflow and UI docs navigation. Reduced motion is enabled. Screenshots were inspected for the mobile home and component catalog.
- Public UI package pack dry-run: seven declared export targets and 13 font files present. Version remains 0.9.2.
- Source direct dependency versions retained except portfolio React/React DOM 19.2.3 to 19.2.7, aligning with UI. Shared React avoids invalid hook calls. Vite remains 7.3.5 and TypeScript 5.9.3.

The browser check found a pre-existing nowrap footer overflow at 390px in UI. Adding flex-wrap fixes it without clipping content. The split docs app now displays the library version instead of its private application version.

Not yet validated: GitHub-hosted workflow execution, Vercel previews with changed roots, affected deployment selection, production cutover, API routing on the new Vercel root and independent production rollback. The PR stays draft until those deployment gates are met. Original contact-form work remains untouched in its original checkout.
