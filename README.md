# Oliver Newth

AI product lead at Google. San Francisco.

I build agent infrastructure — memory, tooling, and interfaces that make AI systems useful over long horizons — plus the smart-home and design systems that run my own life.

## Building

- [r3](https://github.com/n3wth/r3) — persistent memory for AI apps over MCP. Local Redis, optional cloud sync. `npx @n3wth/r3`
- [ui](https://github.com/n3wth/ui) — atomic design system for n3wth sites. Flat, minimal
- [canvas](https://github.com/n3wth/canvas) — live canvases with realtime sync
- [gbrain](https://github.com/n3wth/gbrain) — personal knowledge base an agent can read and write
- [skills](https://skills.n3wth.com) — reusable agent skills, installable via `curl -fsSL https://skills.n3wth.com/install.sh | bash`
- [lunchmoney](https://lunchmoney.sh) — unofficial Lunch Money plugin for Claude, Codex, and Cursor

## Developer documentation

Full docs for UI, Skills, and r3 — installation guides, examples, reference
material, and troubleshooting — are at **[docs.n3wth.com](https://docs.n3wth.com)**.

The docs source lives in this repository at `docs` (a Docs7 project).
To run it locally after the root `npm ci`:

```bash
npx @upstash/docs7 dev docs
```

Validate with `node docs/check.mjs`. See [publishing and setup](docs/publishing.mdx)
for the GitHub connection, production branch, and Context7 indexing configuration.

## Workspace

This repository contains the portfolio, Garden, Skills, and shared UI package in npm workspaces. Use Node 24 and install from the repository root.

```bash
npm install --global npm@11.19.1
npm ci
npm run dev             # Portfolio
npm run build           # All remaining apps and shared packages, once, in dependency order
npm run build:portfolio # Portfolio plus shared UI
npm run check           # Library and app validation in dependency order
npm run check:browser   # All affected public sites after building
```

Applications live in `apps/portfolio`, `apps/garden`, and `apps/skills`. Shared packages live in `packages/ui` and `packages/site-config`. See [workspace architecture](docs/workspace/architecture.md), [deployment steps](docs/workspace/deployment.md) and [maintenance ownership](docs/workspace/maintenance.md). Npm releases of `@n3wth/ui` publish from this repository through the Release UI workflow on a `ui-v*` tag; r3 core releases remain in n3wth/r3.

## Deployment

The remaining sites run on Cloudflare Workers. `npm run build:cloudflare` builds all of
them (or one, with `-- --workspace @n3wth/<app>`); each deployed app's `wrangler.jsonc`
is the production Worker config — name, custom domain, assets, and bindings.
Pull requests get an isolated Cloudflare preview build; commits on `main` deploy
to production for affected projects.

Vercel is a disconnected manual fallback: the Vercel projects retain their
domains and deployment history but no longer receive Git deployments. See the
[deployment runbook](docs/workspace/deployment.md) for the full Cloudflare build
process, the Vercel fallback procedure, and project mappings.

Wait for GitHub CI and the Cloudflare preview checks to pass before merging.
After merging, verify each affected production Worker is live and check routes,
assets, redirects and APIs before reporting a release complete.

## Contact

[n3wth.com](https://n3wth.com) · [LinkedIn](https://linkedin.com/in/n3wth) · hey@n3wth.com
