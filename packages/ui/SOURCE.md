# Source and publishing authority

Imported from https://github.com/n3wth/ui at commit 62839d33ae0a439901b9515339e6259ce6dcf274.

The pilot imported the 0.9.2 source contract. Starting with 2.0.0, publishing moves to this monorepo's publish-ui.yml workflow. The original repository retains its history; retire its publisher after verifying the first monorepo release. See ../../docs/workspace/npm-release.md.

Workspace validation: npm run check --workspace @n3wth/ui. Build the library before consuming it in UI docs. Generated CSS resolves dependencies through package resolution to support hoisted installs.
