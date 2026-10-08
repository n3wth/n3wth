# r3 website

This app redirects the retired r3 website. Published documentation is in docs/r3. The published @n3wth/r3 core, CLI, Redis tests and release workflows remain in n3wth/r3.

- Use the lowercase name r3 and preserve public documentation URLs.
- Run `npm run check -w @n3wth/r3-web` from the workspace root.
- Run `AFFECTED_WORKSPACES='["@n3wth/r3-web"]' npm run check:browser` against the built app.
- The redirect Worker uses wrangler.jsonc directly. No renderer or generated build config is needed.
- Keep the separate worker/ search service and its content corpus until that service is explicitly retired. Its build and deployment are independent of the redirect Worker.
- Do not publish the core package or copy its release workflow here.
