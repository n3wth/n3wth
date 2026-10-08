# Workspace tests

Run commands from the repository root after `npm ci`.

- `browser/`: Portfolio browser checks and retired r3/UI redirect fixtures.
- `garden/`: Garden redirect routes.
- `newsletter/`: Shared signup behavior across Portfolio and Skills, with its Vitest config.

Run newsletter checks with `npm run test:newsletter`.

For browser checks, run `npm run build`, install Chromium with `npx playwright install chromium`, then run `npm run check:browser`. Playwright starts the local servers.

Keep app and package unit tests beside the code they cover. Skills has its own browser suite: `npm run test:browser --workspace @n3wth/skills`.
