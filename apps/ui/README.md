# UI redirects

Cloudflare zone redirect rules own the live UI domain. `worker.mjs` is a local contract fixture for those 301 redirects, not a production service. Documentation routes point to `docs.n3wth.com/ui`; other paths point to the portfolio project. Query parameters are retained.

Run `npm run check -w @n3wth/ui-docs` from the repository root. `npm run dev -w @n3wth/ui-docs` starts the contract fixture locally. Do not deploy it over the live zone rules.

Published documentation lives in [docs/ui](../../docs/ui), and workspace setup lives in the [shared design-system guide](../../docs/workspace/design-system.md). The public UI package remains in `packages/ui`; use root `npm run dev:ui` to watch it alongside the portfolio consumer.
