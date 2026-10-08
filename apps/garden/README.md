# Garden redirects

Garden serves permanent redirects to n3wth.com. Published notes and their parsing pipeline live in [Portfolio](../portfolio); Garden does not render a second reading site.

From the repository root:

```bash
npm run build:portfolio
npm run build:garden
npm run check -w @n3wth/garden
npm run dev -w @n3wth/garden
```

Build Portfolio first so Garden's redirect map matches published notes. Use the root Node and npm versions.

See [AGENTS.md](AGENTS.md) for redirect invariants, the [deployment runbook](../../docs/workspace/deployment.md) for release and rollback, and the [Garden history](../../docs/workspace/garden.md) for the former product and migration.
