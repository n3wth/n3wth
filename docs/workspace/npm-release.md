# UI npm releases

`packages/ui` in `n3wth/n3wth` is the release source starting with 2.0.0.
The former `n3wth/ui` repository is historical; retire its publishing workflow
after the first verified monorepo release. Do not publish from both repositories.

## First release cutover

1. Merge the validated release preparation into main. Keep the repository
   variable `UI_NPM_PUBLISH_ENABLED` unset until the npm trust change is complete.
2. In npm's @n3wth/ui Trusted Publisher settings, change GitHub owner to `n3wth`,
   repository to `n3wth`, workflow filename to `publish-ui.yml`, and leave
   environment blank. Allow `npm publish`. No npm token is required.
3. Set repository Actions variable `UI_NPM_PUBLISH_ENABLED=true`. Run Release UI
   on main. The workflow checks the library, installs the exact tarball into
   a standalone app, builds it, checks browsers, then publishes that tarball.
4. Verify npm version, provenance, exports and a clean registry consumer install.
   Then disable the old publishing workflow and link its README to the monorepo.

## Subsequent releases

Run `npm run changeset`, selecting UI and describing the consumer-facing change.
After Site CI passes on main, Release UI creates or updates a release PR.
Repository Actions settings must allow GitHub Actions to create pull requests.
Merge the reviewed release PR; its successful Site CI triggers publishing.
`npm run release:version` updates versions, changelog, starter and root lockfile.
Already-published versions are skipped. Registry errors fail the workflow.

For retries, manually run Release UI on main. Package checks still run.
The publish job alone has OIDC permission, and uses GitHub-hosted runners.
Never publish locally. Deployment of the sites remains manual and separate.

The initial 2.0.0 version and migration notes are prepared directly for this
cutover. Future version increments are managed through Changesets.

The source adapter for v0 is `packages/ui/v0/n3wth-ui`. It ships with npm but
must still be imported into v0 to become a saved personal/team skill.
