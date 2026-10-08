# r3 website

This app is the documentation website only. The published @n3wth/r3 core, CLI, Redis tests and release workflows remain in n3wth/r3.

- Use the lowercase name r3 and preserve public documentation URLs.
- Run `npm run check -w @n3wth/r3-web` from the workspace root.
- Run `AFFECTED_WORKSPACES='["@n3wth/r3-web"]' npm run check:browser` against the built app.
- Keep content and font reads relative to the app working directory. Vinext builds the Worker with Vite; package `dist/server/wrangler.json`.
- Do not publish the core package or copy its release workflow here.
