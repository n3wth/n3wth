# UI redirects

`worker.mjs` preserves the retired site's 301 redirects. Documentation routes point to `docs.n3wth.com/ui`; other paths point to the portfolio project. Query parameters are retained.

Run `npm run check -w @n3wth/ui-docs` from the repository root. `npm run dev -w @n3wth/ui-docs` starts the redirect Worker locally. Deployment uses `wrangler.jsonc` directly.

Canonical published documentation lives in `docs/ui`. The local `docs/` directory retains source notes and prior documentation for reference. The public UI package remains in `packages/ui`; use root `npm run dev:ui` to watch it alongside the portfolio consumer.
