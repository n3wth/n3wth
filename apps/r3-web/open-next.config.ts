import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// Prerendered pages and route handlers are served from Workers static assets,
// populated by `opennextjs-cloudflare populateCache` after the build, instead
// of being regenerated on each request. Regeneration ran the MDX compiler in
// the Worker, which rejects it: "Code generation from strings disallowed".
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache })
