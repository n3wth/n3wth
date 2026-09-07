# Oliver Newth

AI product lead at Google. San Francisco.

I build agent infrastructure — memory, tooling, and interfaces that make AI systems useful over long horizons — plus the smart-home and design systems that run my own life.

## Building

- [r3](https://github.com/n3wth/r3) — persistent memory for AI apps over MCP. Local Redis, optional cloud sync. `npx @n3wth/r3`
- [kit](https://github.com/n3wth/kit) — component registry that ships your design system to AI coding tools
- [ui](https://github.com/n3wth/ui) — atomic design system for n3wth sites. Flat, minimal
- [canvas](https://github.com/n3wth/canvas) — live canvases with realtime sync
- [gbrain](https://github.com/n3wth/gbrain) — personal knowledge base an agent can read and write
- [skills](https://github.com/n3wth/skills) — reusable agent skills

## Site

This repository contains the portfolio and the UI documentation pilot as independently built npm workspaces. Use Node 24 and install from the repository root.

```bash
npm install --global npm@11.19.1
npm ci
npm run dev             # Portfolio
npm run dev:ui          # Build/watch the UI library and run its docs
npm run build:portfolio
npm run build:ui
npm run check           # Library and app validation in dependency order
npm run check:browser   # After building both apps
```

Applications live in `apps/portfolio` and `apps/ui-docs`. Shared packages live in `packages/ui` and `packages/site-config`. See [workspace architecture](docs/workspace/architecture.md) and [deployment steps](docs/workspace/deployment.md). Public UI package publishing stays in n3wth/ui during the pilot.

## Contact

[n3wth.com](https://n3wth.com) · [LinkedIn](https://linkedin.com/in/newth) · hey@n3wth.com
