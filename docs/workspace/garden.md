# Garden migration

Source: n3wth/newth-garden main d29f51dca83cf3fc5707c6664a8d9b478f1637a9. Snapshot imported into apps/garden without content, public asset or theme changes. Original source history remains in its repository.

Node24/npm11 root npm ci installs the graph. `npm run check -w @n3wth/garden` runs history regression tests, typecheck and the webpack production build. Generic affected-workspace discovery includes Garden automatically. Canonical origins consume site-config; Astryx remains app-local.

The historical note dates are retained. The history generator now handles repository-relative prefixes and ignores initial imported adds for previously recorded notes, while preserving later modification dates. Content and OG fonts require app cwd; output tracing root is the workspace root and existing explicit OG font tracing is retained.

Deployment remains pending pilot acceptance. Existing garden Vercel project prj_VHe8C5iS0N8qEvpjKTtceyUkbiyA must retain garden.n3wth.com and Node24. Proposed source n3wth/n3wth, app root apps/garden, root workspace npm ci, app build. Verify preview routes, note OG fonts and environment scopes before production. Snapshot existing deployment/settings then restore them for rollback. Do not archive source repository.

Lock import preserves all existing pilot package versions. npm reconciled @opentelemetry/api 1.9.0 to existing 1.9.1. Framework/React versions remain the source versions. Package publishing and framework upgrades are outside this import.

Validation: clean root npm ci succeeded; two history regression tests, typecheck and production webpack build passed (959 generated pages). Source checksum comparison covered 288 content/public/theme/history files with zero differences. Generic affected selection includes site-config before Garden. Four browser/HTTP checks pass at 390px and 1440px: note listing, nested note reading, overflow, feeds and OG images. Run `npx playwright test --config playwright.garden.config.ts` after building Garden; a scoped GitHub workflow captures screenshot evidence. Deployed serverless validation remains required before cutover.
