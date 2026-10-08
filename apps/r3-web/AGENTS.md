# r3 website

Cloudflare zone rules redirect the retired r3 website. This app is their local contract fixture. Published documentation is in docs/r3. The published @n3wth/r3 core, CLI, Redis tests and release workflows remain in n3wth/r3.

- Use the lowercase name r3 and preserve public documentation URLs.
- Run `npm run check -w @n3wth/r3-web` from the workspace root.
- Run `AFFECTED_WORKSPACES='["@n3wth/r3-web"]' npm run check:browser` against the built app.
- The local redirect fixture uses wrangler.jsonc directly. No renderer or generated build config is needed. Do not deploy it over the live zone rules.
- Keep the separate worker/ search service and its content corpus until that service is explicitly retired. Its build and deployment are independent of the redirect Worker.
- Do not publish the core package or copy its release workflow here.
