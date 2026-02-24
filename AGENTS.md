# AGENTS.md

## Cursor Cloud specific instructions

This is a **React + TypeScript SPA** (personal portfolio site) built with Vite 7, Tailwind CSS 4, and GSAP for scroll-driven animations. No backend, no database.

### Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (Vite, default port 5173) |
| Lint | `npm run lint` (ESLint 9, flat config) |
| Build | `npm run build` (runs `tsc -b && vite build`) |
| Preview prod build | `npm run preview` |

### Notes

- There are **no automated tests** configured in this project (no test runner or test files).
- The `@n3wth/ui` package is a custom component library fetched from the npm registry; no special auth is needed.
- GSAP animations are scroll-driven; manual browser testing is needed to verify animation behavior.
- When running the dev server in a headless/cloud environment, use `--host 0.0.0.0` to bind to all interfaces: `npm run dev -- --host 0.0.0.0`.
