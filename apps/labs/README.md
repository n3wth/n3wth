# n3wth Lab

Three browser-based tools: a weighted decision comparison, an experiment brief planner, and a product critique canvas. Inputs remain in memory for the current tab; users can download Markdown results. No external APIs, tracking, or server-side user data are required.

## Development

Use Node 24 and npm 11.19.1 from the repository root:

```sh
npm ci
npm run build -- --workspace @n3wth/labs
npm run dev --workspace @n3wth/labs
```

The app consumes the workspace `@n3wth/ui` package. Its public origin is `https://labs.n3wth.com`.

## Hosting

Hosted with Sites, outside the monorepo's direct Wrangler deployment workflows.

- Sites project: `appgprj_6ac09aad2fdc8191a8d141e74e1bf2ab`
- Sites slug: `n3wth-labs`
- Static assets: `apps/labs/dist`
- Publish checkout in this environment: `/workspace/n3wth-labs-site`

Use the Sites hosting workflow with the existing project ID. Build in the monorepo, synchronize the app source and exact output into the publish checkout, push its source commit, and save/deploy an archive of `.openai/hosting.json` and `dist`. Configure `labs.n3wth.com` through Sites and apply its returned DNS validation and routing records in Cloudflare.
