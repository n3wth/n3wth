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

## Design system

Source of truth: `@n3wth/ui/theme` (repo n3wth/ui, src/theme.css). Import tokens, never mirror values:
`@import 'tailwindcss';` then `@import '@n3wth/ui/theme';`

Canonical tokens: bg #08090b | bg-soft #0d0e10 | bg-raise #131316 | ink #f2f3f5 | ink-dim #9aa0a8 | ink-faint #62666d | ink-label #787c83 | ink-ghost #2c2f34 | rail rgba(255,255,255,0.09) | rail-strong rgba(255,255,255,0.17) | accent #ffffff | accent-dim #d4d6da | accent-ink #08090b | ease cubic-bezier(0.16,1,0.3,1)

Rules:
- Geist for display AND body, Geist Mono for code. No other typefaces.
- Flat: no gradients, no glows, no box-shadows. Elevation = bg-raise + rail-strong border.
- No italics for emphasis — weight or color instead.
- Use tokens/utilities (bg-bg, text-ink, border-rail), never hardcoded palette hexes in components.
- Before any UI change ships: run the build, then grep the built CSS for stray hexes, linear-gradient, or box-shadow you introduced.

This site (n3wth.com) is the visual reference implementation. Vite SPA: tokens via @n3wth/ui/theme import, Geist via local @font-face in public/fonts.
