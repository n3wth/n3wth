# Workspace deployment

## Manual release policy

All six applications set `git.deploymentEnabled: false` in their own `vercel.json`. This disables automatic Git deployments for every branch, including main, while keeping the repository connected for manual deployments. GitHub CI continues to validate pushes and pull requests. Committing or merging code does not publish it. The site generator uses the same default.

Vercel reads configuration from the commit being deployed. Bring older branches up to date with this policy before pushing them; their old configuration may still permit automatic deployments. Do not re-enable automatic deployments or add a deployment workflow without an explicit policy change.

1. Choose the exact commit SHA with passing CI and identify the apps changed since each project's last release. Include consumers of changed shared packages; do not compare only the latest commit or assume all projects last released the same SHA.
2. Open the chosen project in the n3wth Vercel team, then **Deployments → Create Deployment**. Enter the SHA and confirm the branch/environment before submitting. Use a feature-branch preview to validate the release before deploying production from main. A main-branch deployment can update the production domain immediately.
3. If the ignore step cancels an intentionally requested deployment, use the dashboard's option to bypass the project's Ignored Build Step for that deployment. Keep the repository's manual-only policy in place.
4. Verify the deployment is Ready, then check affected routes, assets, redirects, and APIs. Record the project, SHA, deployment URL/ID, environment, and checks. Repeat only for the other affected projects.
5. Roll back a release by restoring the previous successful production deployment for that project. Do not rebuild an arbitrary newer commit as a rollback.

Native **Skip deployments when there are no changes to the root directory or its dependencies** is enabled on all six projects. Each project uses its app root with access to files outside that root for shared workspaces. The ignore script is an additional filter for builds that reach the build stage: it compares against the previous deployed tree, or a first-preview merge-base, and builds conservatively when history is unavailable. Neither skipping mechanism replaces manual release intent.

References: [Vercel's manual-only Git configuration](https://vercel.com/docs/project-configuration/git-configuration#turning-off-all-automatic-deployments), [deploying a Git reference](https://vercel.com/docs/git#creating-a-deployment-from-a-git-reference), and [monorepo setup](https://vercel.com/docs/monorepos).

## Project layout and migration history

The pilot shipped in PR #149 at 98e871cc6b20e78b772eed32d39ded5357f33772 on September 6 2026. Both projects retain their domains and now build from n3wth/n3wth.

| Project | Previous source root | Workspace root | Build |
| --- | --- | --- | --- |
| n3wth | . | apps/portfolio | cd ../.. && npm run build:portfolio |
| ui | . in n3wth/ui | apps/ui-docs in n3wth/n3wth | cd ../.. && npm run build:ui-docs |
| garden | . in n3wth/newth-garden | apps/garden | cd ../.. && npm run build:garden |
| skills | . in n3wth/skills | apps/skills | cd ../.. && npm run build:skills |
| kit | . in n3wth/kit | apps/kit | cd ../.. && npm run build:kit |
| r3 | website in n3wth/r3 | apps/r3-web | cd ../.. && npm run build:r3 |

Use Node 24 and npm 11.19.1. Portfolio's `scripts/vercel-install.mjs` uses a filtered incremental install for `@n3wth/portfolio`, `@n3wth/ui`, and `@n3wth/site-config`, excluding root-only browser and asset-generation tooling. It reuses Vercel's restored node_modules and fails if npm changes the committed dependency resolution; extraneous installed-package inventory is discarded and the original lockfile bytes retained. Other apps and CI continue to use `npm ci`; see each app's vercel.json for its commands. Enable access to files outside the app root for workspace packages. Preserve the project identities, domains, environment scopes and API functions. Each source switch follows a verified preview and combined workspace checks.

Portfolio adds `--cache-ui` to its root build command. UI output is stored under `node_modules/.cache/n3wth-ui-build`, within Vercel's default dependency cache. A content key includes UI sources, scripts, fonts, configuration, local environment files, Vite environment variables, root manifests and lockfile, cache/build scripts, and Node version/platform/architecture. Every cached output file is hashed before restoration; a miss or corrupt cache runs the normal UI build. Portfolio always rebuilds, including data refresh and metadata generation. CI and default local builds do not opt into this artifact cache. To force a full Vercel build, disable the build cache for that deployment. See [build measurements](build-performance.md).

Before changing settings, export a configuration snapshot containing project IDs, Git source, root, framework, install/build/output settings and deployment IDs. Include environment names/scopes only. Verify the old production deployment remains available.

Preview validation: build each app from this branch with its proposed root, then verify assets, navigation, redirects and API routing. Verify an app-only change affects one preview and a shared-package change affects its consumers. The GitHub affected checker currently owns validation selection; Vercel deployment selection must also be verified separately.

Rollback: promote the previous deployment for only the affected project and restore its saved root/build/install/Git-source settings. Reverting code alone is insufficient after a root or repository change. Keep n3wth/ui and public package publishing intact throughout the pilot.

## Production deployment record

| Project | Workspace production | Previous production |
| --- | --- | --- |
| n3wth | dpl_GqqYgKhSJbafRf4b8sqpqGMb95N4 | dpl_GAdTbz6LsaGHevAK8CnjHfQZqMRt |
| ui | dpl_EPbAurrHy3TSqybLiMYHJHMovN96 | dpl_4Do4hHkL1jrv78fkivi7WC5tw1aS |

Previous n3wth settings: repository n3wth/n3wth, root null, framework vite, Node 24.x, build/install/output null. Previous ui settings: repository n3wth/ui, root null, framework vite, Node 24.x, build npm run demo, install/output null. Both allow source files outside the app root. Preserve existing environment scopes during rollback.

Portfolio, Garden, Kit, Skills and r3 build through the root app-targeted scripts so shared UI is built once first; UI docs uses `cd ../.. && npm run build:ui-docs`. Their outputs are app-local dist or Next output. Each app uses scripts/vercel-ignore.mjs to select deployment from the same affected graph as CI. Missing or invalid comparison history builds safely instead of skipping.
