# Workspace deployment

## Cloudflare builds and configuration

Cloudflare Workers serves the six public sites. Use Node 24 and npm 11.19.1,
then run `npm ci` at the repository root.

```bash
# Build all six Workers and their assets. Shared packages build once.
npm run build:cloudflare

# Select one site, or repeat --workspace to select several.
npm run build:cloudflare -- --workspace @n3wth/garden

# Inspect dependency order without building.
npm run build:cloudflare -- --workspace @n3wth/garden --list

# Check packaging after building; this does not deploy.
npm exec -- wrangler deploy --config apps/garden/wrangler.jsonc --dry-run
```

The command uses the same workspace graph as `npm run build`. Portfolio and
UI docs use their existing static builds. Garden, Kit, Skills and r3 use their
pinned OpenNext adapter. Do not run a separate shared-package prebuild.

Each `apps/<app>/wrangler.jsonc` is the production configuration: Worker name,
custom domain, assets and resource bindings. There are no separate production
config files. Inspect the target before using Wrangler; a deploy with this config
changes production. Build and package in the same checkout and operating system.
OpenNext output and generated preview configs can contain absolute paths; do not
copy them to another machine for deployment.

The Cloudflare preview workflow uses this build command, then
`scripts/cloudflare-preview.mjs` generates an isolated config under `.cloudflare/`.
It replaces the Worker name, domain, self-service binding and Skills auth origin,
requires explicit preview stateful bindings, and adds preview-only noindex behavior.
Secrets stay outside source config and are provisioned separately for each Worker.
Never deploy generated preview config to production or point a preview at the
production database.

A build or dry run does not prove live readiness. Check TLS, page content, assets
and the app's required API behavior on the target domain. Production automation,
readiness gates, D1 setup and rollback tracking remain separate work.

## Vercel fallback: automatic Git deployment policy

Keep these projects and their Git deployment settings during the Cloudflare
transition. A successful Vercel deployment does not prove that a Cloudflare public
domain serves the same commit.

All six applications set `git.deploymentEnabled: true` in their own `vercel.json`, and the site generator uses the same default. Pushes to non-production branches and pull-request updates create Preview deployments. Commits on each project's configured production branch (`main`) create Production deployments.

Reviewers must wait for passing GitHub CI checks before merging. The current branch ruleset does not enforce CI or pull requests, and Vercel deployments can start independently of GitHub CI.

1. Before merging, confirm CI passes and review the affected projects' Preview deployments. Include consumers of changed shared packages when deciding what should deploy.
2. Merge the reviewed commit to `main`. Vercel creates Production deployments for affected projects and skips projects outside the change graph.
3. Verify each affected deployment is Ready, then check routes, assets, redirects, and APIs. Record the project, commit SHA, deployment URL/ID, environment, and checks before reporting the release complete.
4. If an expected deployment is skipped, inspect the changed-workspace graph first. Use the dashboard's Ignored Build Step bypass only for an intentional manual deployment or redeployment.

Vercel reads configuration from the commit being deployed. Bring older branches up to date before pushing them so `git.deploymentEnabled: true` is present and the current ignore logic is used.

Native **Skip deployments when there are no changes to the root directory or its dependencies** is enabled on all six projects. Each project uses its app root with access to files outside that root for shared workspaces. The ignore script is an additional filter for builds that reach the build stage: it compares against the previous deployed tree, or a first-preview merge-base, and builds conservatively when history is unavailable.

For rollback, restore the previous successful Production deployment for only the affected project. For an explicitly requested manual redeployment, choose the exact tested commit SHA and confirm the target environment before submitting. Do not rebuild an arbitrary newer commit as a rollback.

References: [Vercel Git deployments](https://vercel.com/docs/git), [Git deployment configuration](https://vercel.com/docs/project-configuration/git-configuration), [deploying a Git reference](https://vercel.com/docs/git#creating-a-deployment-from-a-git-reference), and [monorepo setup](https://vercel.com/docs/monorepos).

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

Use Node 24 and npm 11.19.1. Every app installs with `scripts/vercel-install.mjs <workspace>`, which resolves the app and the workspace packages it builds from out of the same dependency graph the affected checker uses, then runs a filtered incremental install for exactly those. Root-only browser and asset-generation tooling, and every other app's dependencies, stay out of the deployment tree. It reuses Vercel's restored node_modules and fails if npm changes the committed dependency resolution; extraneous installed-package inventory is discarded and the original lockfile bytes retained. CI continues to use `npm ci`; see each app's vercel.json for its commands. Enable access to files outside the app root for workspace packages. Preserve the project identities, domains, environment scopes and API functions. Each source switch follows a verified preview and combined workspace checks.

Every app adds `--cache-ui` to its root build command. UI output is stored under `node_modules/.cache/n3wth-ui-build`, within Vercel's default dependency cache. A content key includes UI sources, scripts, fonts, configuration, local environment files, Vite environment variables, root manifests and lockfile, cache/build scripts, and Node version/platform/architecture. Every cached output file is hashed before restoration; a miss or corrupt cache runs the normal UI build. Each app itself always rebuilds, including portfolio's data refresh and metadata generation. CI and default local builds do not opt into this artifact cache. To force a full Vercel build, disable the build cache for that deployment. See [build measurements](build-performance.md).

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
