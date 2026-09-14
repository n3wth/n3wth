# Package releases

Run `npm run changeset` for changes to public packages. Select `@n3wth/ui`
and describe the consumer-visible change. CI creates a version PR after main
passes Site CI. Merging the version PR publishes after its Site CI succeeds.
See `docs/workspace/npm-release.md` for the trusted-publisher cutover.
