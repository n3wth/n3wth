# r3 redirects

`worker.mjs` preserves the retired site's 308 redirects. Documentation routes point to `docs.n3wth.com/r3`; other paths point to the portfolio project. Query parameters are retained.

Run `npm run check -w @n3wth/r3-web` from the repository root. `npm run dev -w @n3wth/r3-web` starts the redirect Worker locally. Deployment uses `wrangler.jsonc` directly.

Canonical published documentation lives in `docs/r3`. The separate `worker/` search service still uses the legacy `content/docs` corpus, `lib` parsers, and schema-sync scripts. Those files remain for that service; they are not part of the redirect build. Retiring or migrating search requires a separate verified cutover.
