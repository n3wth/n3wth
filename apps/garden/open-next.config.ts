import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

/* Every page and route except /random and /api/ai-search is SSG. The
   default (dummy) incremental cache drops prerender results, so the
   worker re-rendered pages on demand — which used to crash on the
   filesystem content reads. Serve prerenders from the bundled assets;
   revalidation is not wanted, which is exactly this override's contract. */
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache })
