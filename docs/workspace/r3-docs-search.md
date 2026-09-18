# r3 documentation search

The r3 frontend stays on Vercel. The public `r3-docs-search` Worker in the n3wth Cloudflare account answers documentation questions through Workers AI. It has no credentials, memory access, command execution, or write tools.

`apps/r3-web/lib/docs-content.ts` converts local MDX into Markdown without changing fenced examples. It produces page exports, `llms-full.txt`, and `docs-index.json` from the same content. Search ranks sections with a shared keyword ranker. AI answers use six retrieved sections, a 500-character question limit, and a 700-token output limit. Citation URLs come from the index, never model output.

The Worker fetches the production index with a five-minute edge cache. Each Vercel production release therefore updates search without a separate indexing job. If that fetch fails, it uses the documentation snapshot bundled at Worker deployment. Its response includes the corpus revision. Logs record fallback and error events without questions or excerpt text.

Cloudflare rate limit bindings allow ten requests per minute per IP and sixty total per minute **per Cloudflare location**. These are abuse controls, not a global spending cap. CORS permits r3 production, the project's Vercel previews, and the two documented local preview ports. The endpoint is public; CORS is not authentication.

## Validate and deploy

Use Node 24 and npm 11.19.1 at the repository root:

```sh
npm run search:check -w @n3wth/r3-web
npm exec -w @n3wth/r3-web -- wrangler deploy --config worker/wrangler.jsonc --dry-run
npm run search:deploy -w @n3wth/r3-web
```

Wrangler generates `Env` from its config and bundles a fresh corpus. Deploy the reviewed Worker when its code/config changes; content-only releases refresh through the production endpoint automatically. Keep the six Vercel projects and Git deployment policy unchanged. Verify a real `/ask` response from an allowed Origin after deploying, including citations and the corpus revision. Roll back with the previous Cloudflare Worker version if needed.

## Released API documentation

`npm run docs:sync -w @n3wth/r3-web` fetches the source tag matching `lib/version.ts`, extracts only literal tool definitions with the TypeScript parser, and regenerates `public/mcp-tools.json` and the API reference. It never executes the core server. Review the generated diff against the release before merging. The changelog is a curated release summary; update it from upstream GitHub release notes when bumping the published version. Do not generate or execute MDX from untrusted remote release bodies.
