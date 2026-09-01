# AGENTS.md

Oliver Newth's personal site (n3wth.com).

## Quick Start

```bash
npm install
npm run dev      # Vite dev server
npm run build    # tsc + vite build (verify before committing)
```

## Stack

- **Framework:** React 19 + TypeScript + Vite 7
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`, `@theme` in CSS, `@source` directive)
- **Animation:** GSAP 3 (ScrollTrigger, SplitText) - always import from `src/lib/gsap.ts`
- **UI Library:** `@n3wth/ui` (shared component library - Nav, Footer, NoiseOverlay)
- **Analytics:** PostHog (deferred load via `requestIdleCallback`)
- **Fonts:** Satoshi (display), Geist Sans (body), Geist Mono (code)
- **Deploy:** Vercel

## Architecture

- `src/App.tsx` - Layout shell, lazy loads all sections except Hero
- `src/components/sections/` - Page sections (Experience, Building, Thinking, Creative, Contact)
- `src/components/NightField.tsx` - Homepage 3D night field (three.js portals; identity layer paints above the loader)
- `src/components/thinking/` - Thinking piece registry, kit, and pieces (one route per piece)
- `src/data/content.ts` - All site content (experiences, frameworks, installations)
- `src/data/thinking.ts` - Thought pieces content
- `src/lib/gsap.ts` - Centralized GSAP plugin registration (always import from here)

## Design

- Before any visual/design work, load `.agents/skills/frontend-design/SKILL.md` and `.agents/skills/hallmark/SKILL.md` (anti-AI-slop design) and design against both.
- Before writing or editing any user-facing copy, load `.agents/skills/anti-ai-slop-writing/SKILL.md` and follow its constraints (banned vocabulary, no detectable AI patterns).
- Weights: this site's heaviest font weight is semibold (600) - never use bold/700.

## Voice

- The homepage, /work, and /thinking share one quiet voice: plain declarative sentences, lowercase-calm, no hype, no exclamation points, no marketing adjectives ("innovative", "cutting-edge", "passionate"). Facts stated once, then left alone. When editing copy on these pages, match what's already there rather than raising the temperature.
- Contact email is `hey@n3wth.com` everywhere (already in `src/data/content.ts` as `siteConfig.email` — use that, never hardcode a different address). `support@n3wth.com` on /support is intentional and separate.
- **Do not change art credits.** The credit lines and credit links on installations (`src/data/content.ts` installations, rendered by `src/components/sections/Creative.tsx`) are factual attributions — never reword, trim, or "improve" them.
- **Do not change OG/social meta.** The `og:*` and `twitter:*` tags and `og-image.png` in `index.html` stay as-is unless the user explicitly asks.

## Key Conventions

- **GSAP imports:** Always use `import { gsap, useGSAP } from '../../lib/gsap'` - never import gsap directly or re-register plugins. Scroll-driven pieces import `{ gsap, useGSAP, ScrollTrigger, SplitText }` from `src/lib/scroll.ts` instead (registers scroll plugins once, ships in a lazy `gsap-scroll` chunk). Official GSAP skills are vendored in `.agents/skills/gsap-*` - load the relevant ones before writing animation code
- **Reduced motion:** Every animation block must check `prefers-reduced-motion` and bail early
- **Lazy loading:** Below-fold sections use `React.lazy()` + `Suspense`
- **CSS variables:** Use `var(--color-grey-400)` etc. from index.css, not hardcoded colors
- **Font classes:** `font-display` (Satoshi), `font-sans` (Geist Sans), `font-mono` (Geist Mono)
- **Mobile:** All interactive elements have min 44px touch targets. Use responsive classes (sm/md/lg breakpoints)
- **SEO:** Static HTML fallback in index.html for crawlers. Structured data (JSON-LD Person schema)

## Performance Notes

- PostHog deferred via `requestIdleCallback` - not in critical path
- Creative section background images only mount when section approaches viewport (IntersectionObserver)
- NightField garnish models (teapot, bike, suzanne) share the scene Suspense boundary; deferring them needs a nested boundary
- Animated fixed elements use `will-change: transform` for GPU compositing
- Font preloads in index.html head for Geist Sans (Regular + SemiBold)

## File Naming

- Components: PascalCase (`NightField.tsx`)
- Data files: camelCase (`content.ts`)
- Section components live in `src/components/sections/`

## Cursor Cloud specific instructions

This is a **React + TypeScript SPA** (personal portfolio site) built with Vite 7, Tailwind CSS 4, and GSAP for scroll-driven animations. No backend, no database.

### Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (Vite, default port 5173) |
| Lint | `npm run lint` (ESLint 9, flat config) |
| Test | `npm test -- --run` (Vitest + jsdom; drop `--run` for watch mode) |
| Build | `npm run build` (runs `tsc -b && vite build`) |
| Preview prod build | `npm run preview` |

### Notes

- Tests run on **Vitest** with jsdom (`src/test/setup.ts`); test files live under `src/**/__tests__`. `npm test` starts watch mode, so use `npm test -- --run` for a single non-interactive pass.
- `npm run build` runs `prebuild` scripts that fetch GitHub/garden data over the network; they fail gracefully and keep the committed snapshot when offline or rate-limited, so the build still succeeds without network access.
- The `@n3wth/ui` package is a custom component library fetched from the npm registry; no special auth is needed.
- GSAP animations are scroll-driven; manual browser testing is needed to verify animation behavior.
- When running the dev server in a headless/cloud environment, use `--host 0.0.0.0` to bind to all interfaces: `npm run dev -- --host 0.0.0.0`.

### Copy and diagram taste (Thinking pieces, learned from direct user feedback)

- Never end a sentence on a mirrored "X, not Y" aphorism ("it's a memory problem, not a compute one"). Reads as generated. State the fact plainly instead.
- Don't put `font-mono` on plain metadata (dates, labels) that isn't code, a timestamp log, or terminal output — it's a borrowed technical costume, not a real constraint.
- No "The test:" callout lines, no big display numerals as an index device — both were tried on the /thinking index and explicitly rejected by the user ("i hate these bits", "i dislike the big numbers").
- SVG `preserveAspectRatio="none"` on a multi-segment bezier curve stretched into an arbitrary tall box distorts it into a kinked, broken-looking line. Use a fixed-aspect motif (see `MarginNote.tsx`) or a plain CSS border instead.
- For node/edge diagrams, use the shared organic bezier curve (`src/components/thinking/kit/edgePath.ts`, consumed by `FlowDiagram.tsx`) rather than straight `<line>` elements — straight grey lines read as a static wiring diagram, not something flowing.
- Compliance, non-negotiable: never mention Claude, Anthropic, GPT, ChatGPT, OpenAI, or any other LLM brand anywhere on this site (or garden.n3wth.com, or hop) — the user works at Google and is not permitted to. Grep for `claude|anthropic|gpt|chatgpt|openai|sonnet|opus|grok|llama|copilot|qwen|mistral|deepmind` before committing any new copy.
