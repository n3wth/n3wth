# AGENTS.md

Garden now serves permanent redirects to n3wth.com. Published Markdown and its
parsing pipeline belong to `../portfolio/content` and `../portfolio/scripts/notes`.
Do not restore live Garden fetching or introduce a second reading application.

- `worker.mjs` serves the generated redirect map and genuine unknown-path 404s.
- Build portfolio before Garden so `redirects.json` matches published content.
- Keep note destinations at `/thinking/<slug>`, preserving nested paths and aliases.
- Homepage and world routes converge on the portfolio homepage; topic routes use Thinking filters.
- Run `npm run check` for redirect tests and packaging; `npm run typecheck` checks Worker syntax.
- Use Node 24. Keep the existing Cloudflare domain and Worker identity.
- Follow `../../docs/workspace/deployment.md`: verify portfolio live before switching Garden redirects and retain prior Worker versions for rollback.
