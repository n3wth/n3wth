# Pilot deployment checklist

The pilot shipped in PR #149 at 98e871cc6b20e78b772eed32d39ded5357f33772 on September 6 2026. Both projects retain their domains and now build from n3wth/n3wth.

| Project | Existing root | Pilot root | Build |
| --- | --- | --- | --- |
| n3wth | . | apps/portfolio | npm run build from app |
| ui | . in n3wth/ui | apps/ui-docs in n3wth/n3wth | cd ../.. && npm run build:ui |

Both installs run npm ci from the repository root. Enable access to files outside the app root for workspace packages. Preserve the project domains, environment scopes and portfolio API functions. UI must remain connected to its existing production source until the pilot preview has been verified; changing its Git source is an explicit cutover step.

Before changing settings, export a configuration snapshot containing project IDs, Git source, root, framework, install/build/output settings and deployment IDs. Include environment names/scopes only. Verify the old production deployment remains available.

Preview validation: build each app from this branch with its proposed root, then verify assets, navigation, redirects and API routing. Verify an app-only change affects one preview and a shared-package change affects its consumers. The GitHub affected checker currently owns validation selection; Vercel deployment selection must also be verified separately.

Rollback: promote the previous deployment for only the affected project and restore its saved root/build/install/Git-source settings. Reverting code alone is insufficient after a root or repository change. Keep n3wth/ui and public package publishing intact throughout the pilot.

## Production deployment record

| Project | Workspace production | Previous production |
| --- | --- | --- |
| n3wth | dpl_GqqYgKhSJbafRf4b8sqpqGMb95N4 | dpl_GAdTbz6LsaGHevAK8CnjHfQZqMRt |
| ui | dpl_EPbAurrHy3TSqybLiMYHJHMovN96 | dpl_4Do4hHkL1jrv78fkivi7WC5tw1aS |

Previous n3wth settings: repository n3wth/n3wth, root null, framework vite, Node 24.x, build/install/output null. Previous ui settings: repository n3wth/ui, root null, framework vite, Node 24.x, build npm run demo, install/output null. Both allow source files outside the app root. Preserve existing environment scopes during rollback.

Current installs use `cd ../.. && npx --yes npm@11.19.1 ci`; portfolio builds with `npm run build`, UI docs with `cd ../.. && npm run build:ui`. Outputs are app-local dist. Each app uses scripts/vercel-ignore.mjs to select deployment from the same affected graph as CI. Missing or invalid comparison history builds safely instead of skipping.
