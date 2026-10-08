# r3 redirects

Cloudflare zone redirect rules own the live r3 domain. `worker.mjs` is a local contract fixture for those 308 redirects, not a production service. Documentation routes point to `docs.n3wth.com/r3`; other paths point to the portfolio project. Query parameters are retained.

Run `npm run check -w @n3wth/r3-web` from the repository root. `npm run dev -w @n3wth/r3-web` starts the contract fixture locally. Do not deploy it over the live zone rules.

Canonical published documentation lives in `docs/r3`. The separate `worker/` search service still uses the legacy `content/docs` corpus, `lib` parsers, and schema-sync scripts. Those files remain for that service; they are not part of the redirect build. Retiring or migrating search requires a separate verified cutover.
