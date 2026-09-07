# Workspace maintenance

## Sources of truth

| Responsibility | Source |
| --- | --- |
| Six websites and preview deployments | n3wth/n3wth apps/* |
| Canonical public origins | packages/site-config |
| Installed workspace dependencies | Root package-lock.json with npm 11.19.1 |
| Public @n3wth/ui publishing | n3wth/ui |
| r3 core runtime and releases | n3wth/r3 |
| Skills installer and preserved CLI/editor sources | apps/skills |
| Kit registry and preserved CLI source | apps/kit |
| Garden published notes | apps/garden content in Git |

Change shared origins once in site-config. Framework-specific components remain with each application. Registry-pinned UI consumers retain their tested versions; they do not silently consume the local library.

## Development and validation

Install at the root with Node 24 and npm 11.19.1. Use each application's workspace scripts for development. Run npm run check:affected for a branch and npm run check for the complete workspace. The lock-aware graph follows installed workspace links, including transitive consumers. Unknown lock metadata falls back to conservative validation.

Run the affected browser suites after their application builds. Do not run multiple Playwright configurations against the same output directory concurrently. CI covers responsive routes and installers; it does not prove configured authentication or third-party delivery.

Dependabot owns the root workspace lock, GitHub Actions and standalone nested CLI/editor packages. Pending dependency upgrades from retired repositories are tracked separately in Linear. Do not combine broad upgrades with a source migration.

## Repository retirement

Archive Garden, Kit and Skills source repositories only after their replacement is deployed, active source and installer URLs are updated, maintenance workflows are transferred and open work is linked to its replacement issue. Save previous repository metadata and deployment settings. Leave a new-source notice and preserve Git history through archival.

Keep n3wth/ui and n3wth/r3 active because they still own published packages. Archiving a website's old repository does not remove its Vercel project, domains, environment variables or historical deployments.
