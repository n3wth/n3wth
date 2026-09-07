# Pilot deployment checklist

This branch prepares workspace source. Do not merge the directory move until the Vercel configuration and independent previews are ready (N-411 and N-413).

| Project | Existing root | Pilot root | Build |
| --- | --- | --- | --- |
| n3wth | . | apps/portfolio | npm run build from app |
| ui | . in n3wth/ui | apps/ui-docs in n3wth/n3wth | cd ../.. && npm run build:ui |

Both installs run npm ci from the repository root. Enable access to files outside the app root for workspace packages. Preserve the project domains, environment scopes and portfolio API functions. UI must remain connected to its existing production source until the pilot preview has been verified; changing its Git source is an explicit cutover step.

Before changing settings, export a configuration snapshot containing project IDs, Git source, root, framework, install/build/output settings and deployment IDs. Include environment names/scopes only. Verify the old production deployment remains available.

Preview validation: build each app from this branch with its proposed root, then verify assets, navigation, redirects and API routing. Verify an app-only change affects one preview and a shared-package change affects its consumers. The GitHub affected checker currently owns validation selection; Vercel deployment selection must also be verified separately.

Rollback: promote the previous deployment for only the affected project and restore its saved root/build/install/Git-source settings. Reverting code alone is insufficient after a root or repository change. Keep n3wth/ui and public package publishing intact throughout the pilot.
