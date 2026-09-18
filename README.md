# Oliver Newth

AI product lead at Google. San Francisco.

I build agent infrastructure — memory, tooling, and interfaces that make AI systems useful over long horizons — plus the smart-home and design systems that run my own life.

## Building

- [r3](https://github.com/n3wth/r3) — persistent memory for AI apps over MCP. Local Redis, optional cloud sync. `npx @n3wth/r3`
- [kit](apps/kit) — component registry that ships your design system to AI coding tools
- [ui](https://github.com/n3wth/ui) — atomic design system for n3wth sites. Flat, minimal
- [canvas](https://github.com/n3wth/canvas) — live canvases with realtime sync
- [gbrain](https://github.com/n3wth/gbrain) — personal knowledge base an agent can read and write
- [skills](apps/skills) — reusable agent skills
- [lunchmoney](https://lunchmoney.sh) — unofficial Lunch Money plugin for Claude, Codex, and Cursor

## Site

This repository contains six independently deployed sites in npm workspaces. Use Node 24 and install from the repository root.

```bash
npm install --global npm@11.19.1
npm ci
npm run dev             # Portfolio
npm run dev:ui          # Build/watch the UI library and run its docs
npm run build           # All six apps and shared packages, once, in dependency order
npm run build:portfolio # App plus shared UI; also garden, kit, skills, r3, ui-docs
npm run check           # Library and app validation in dependency order
npm run check:browser   # Portfolio, UI docs and Kit after building
```

Applications live in `apps/portfolio`, `apps/ui-docs`, `apps/garden`, `apps/skills`, `apps/kit` and `apps/r3-web`. Shared packages live in `packages/ui` and `packages/site-config`. See [workspace architecture](docs/workspace/architecture.md), [deployment steps](docs/workspace/deployment.md) and [maintenance ownership](docs/workspace/maintenance.md). Npm releases of `@n3wth/ui` publish from this repository with Changesets and the Release UI workflow; r3 core releases remain in n3wth/r3.

## Deployment

All six sites deploy automatically from Git. Feature branches and pull requests create Preview deployments; commits on `main` create Production deployments for affected projects while unchanged projects are skipped. Each app's `vercel.json` keeps `git.deploymentEnabled` set to `true`, and new sites inherit this from the generator.

Wait for GitHub CI to pass and review affected Preview deployments before merging. After merging, verify each affected Production deployment is Ready and check routes, assets, redirects and APIs before reporting a release complete. See the [deployment runbook](docs/workspace/deployment.md) for project mappings, validation, and rollback. Older branches must pick up the current configuration before further pushes to follow this policy.

## Contact

[n3wth.com](https://n3wth.com) · [LinkedIn](https://linkedin.com/in/n3wth) · hey@n3wth.com
