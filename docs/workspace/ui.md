# UI workspace inventory

Source: n3wth/ui main 62839d33ae0a439901b9515339e6259ce6dcf274, verified with GitHub API and fetched 2026-09-06. Imported tracked snapshot from git archive. Original checkout /tmp/swarm-align/ui remains on its original feature branch. Original repository history is retained externally.

## Verified

- Node 24, Vite 7, React 19, Tailwind 4. Existing native validation: lint, library build, demo build and Vitest.
- Public package @n3wth/ui 0.9.2 exports root, /og, /styles, /tailwind and /theme. Ships dist, tailwind.preset.cjs and public/fonts. React 18/19 peer contract and optional GSAP peer retained.
- Kit and r3 website declare UI ^0.9.1; Skills ^0.6.1. These consumers remain on npm during the pilot. Portfolio currently does not consume UI.
- Original release workflow publishes to npm and GitHub Packages on GitHub release creation. It remains authoritative in n3wth/ui. No publishing workflows were imported into the pilot.
- Original Vercel repository config builds demo to dist-demo with npm ci and retains security headers. Main commit Vercel status succeeded: https://vercel.com/n3wth/ui/4Do4hHkL1jrv78fkivi7WC5tw1aS.

## Pilot implementation

- Library moved to packages/ui. Demo/docs/public assets moved to apps/ui-docs. Public fonts retained in both appropriate outputs.
- Demo relative source imports replaced by @n3wth/ui public imports. Canonical footer URLs consume private @n3wth/site-config. Public component APIs, content and visual intent unchanged.
- CSS packaging resolves Astryx through Node package resolution instead of a cwd-relative node_modules path, supporting npm hoisting.
- Demo Tailwind scans built library modules; UI must build before docs. Existing React JSX development-runtime production shim retained.
- Original 376 library tests and one demo navigation test remain in their respective packages.
- UI docs Vercel file installs at workspace root, invokes root build:ui and outputs app-local dist. Live project settings have not been changed.

## Validation

Library lint/build and 376 tests passed. UI docs production build and its navigation test passed. Pack audit verified declared entries and exposed an existing missing /og JavaScript entry; the pilot makes that barrel an explicit Vite entry.

## Not yet verified by this inventory

Live Vercel project inspect verified ui (prj_qVXpXnohKgRXaNwzePTCGm9pvRD9), root '.', Node 24, Vite, dashboard build command npm run demo, no explicit output override. The committed Vercel configuration overrides the demo build command. Environment configuration, package registry trusted-publisher settings, and successful deployment from the new workspace remain deployment/publishing checks. Root clean-install validation is coordinated by parent implementation agent.
