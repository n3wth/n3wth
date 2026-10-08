# Workspace scripts

Run commands from the repository root. Prefer the existing `npm run` commands.

| Directory | Purpose | Entry points |
| --- | --- | --- |
| `workspace/` | Dependency-aware builds, validation and site creation | `npm run build`, `npm run check`, `npm run site:new` |
| `cloudflare/` | Deployment selection and isolated preview lifecycle | GitHub Cloudflare workflows |
| `ui/` | Shared UI development, package verification and publishing | `npm run dev:ui`, `npm run check:package` |
| `assets/` | Site icons, social cards and embedded fonts | `npm run icons`, `npm run social` |
| `content/` | Built metadata and article audits | `npm run check:metadata`, `npm run content:audit` |
| `migrations/` | Database and newsletter imports, with rehearsal fixtures | [Migration runbook](../docs/workspace/cloudflare-cutover.md) |

Tests stay beside their scripts. Run all script tests with
`node --test scripts/**/*.test.mjs`.
