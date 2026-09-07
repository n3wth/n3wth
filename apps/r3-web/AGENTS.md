# r3 website

This app is the documentation website only. The published @n3wth/r3 core, CLI, Redis tests and release workflows remain in n3wth/r3.

- Use the lowercase name r3 and preserve public documentation URLs.
- Run `npm run check -w @n3wth/r3-web` from the workspace root.
- Run `npx playwright test --config playwright.r3.config.ts` against the built app.
- Keep content and font reads relative to the app working directory. Next file tracing includes the workspace root.
- Do not publish the core package or copy its release workflow here.
