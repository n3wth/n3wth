# Garden migration

Source: n3wth/newth-garden main d29f51dca83cf3fc5707c6664a8d9b478f1637a9. Snapshot imported into apps/garden without content, public asset or theme changes. Original source history remains in its repository.

Homepage improvements also preserved from clean feat/3d-fidelity commit 6208264: ground texture assets, GardenSurface, responsive scene framing, fixed camera position, charcoal ground, compact hero and family links in document flow. Its equivalent 480px navigation adjustment is superseded by the migration's tested 600px responsive layout; homepage top spacing uses the same breakpoint. The original worktree was not modified. Eight browser/HTTP checks now cover home, note listing and nested notes at 320/390/600/1440px, including heading clearance below the nav.

Node24/npm11 root npm ci installs the graph. `npm run check -w @n3wth/garden` runs history regression tests, typecheck and the webpack production build. Generic affected-workspace discovery includes Garden automatically. Canonical origins consume site-config; Astryx remains app-local.

The historical note dates are retained. The history generator now handles repository-relative prefixes and ignores initial imported adds for previously recorded notes, while preserving later modification dates. Content and OG fonts require app cwd; output tracing root is the workspace root and existing explicit OG font tracing is retained.

Deployment remains pending pilot acceptance. Existing garden Vercel project prj_VHe8C5iS0N8qEvpjKTtceyUkbiyA must retain garden.n3wth.com and Node24. Proposed source n3wth/n3wth, app root apps/garden, root workspace npm ci, app build. Verify preview routes, note OG fonts and environment scopes before production. Snapshot existing deployment/settings then restore them for rollback. Do not archive source repository.

Review follow-up bounds the existing public search proxy per request: 2048 request bytes, a trimmed 1–500 character query, 15 seconds through request/upstream streaming, and 65536 response bytes. Deadlines, output limits and client disconnects cancel upstream consumption. Six mocked tests cover invalid/chunked input, output bounds and cancellation without paid upstream calls. These are per-request limits, not a distributed rate limiter or a guarantee of provider billing limits.

Lock import preserves all existing pilot package versions. npm reconciled @opentelemetry/api 1.9.0 to existing 1.9.1. Framework/React versions remain the source versions. Package publishing and framework upgrades are outside this import.

Validation: clean root npm ci succeeded; two history regression tests, typecheck and production webpack build passed (959 generated pages). Source checksum comparison covered 288 content/public/theme/history files with zero differences. Generic affected selection includes site-config before Garden. Six browser/HTTP checks pass at 320px, 390px and 1440px: note listing, nested note reading, each navigation control's viewport bounds, feeds and OG images. Run `npx playwright test --config playwright.garden.config.ts` after building Garden; a scoped GitHub workflow captures screenshot evidence. Deployed serverless validation remains required before cutover.
