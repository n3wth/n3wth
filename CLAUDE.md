# n3wth.com - Oliver Newth's Personal Site

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
- **Fonts:** Mona Sans (display), Geist Sans (body), Geist Mono (code)
- **Deploy:** Vercel

## Architecture
- `src/App.tsx` - Layout shell, lazy loads all sections except Hero
- `src/components/sections/` - Page sections (Hero, Experience, Thinking, Frameworks, Creative, Contact)
- `src/components/shapes/` - Decorative SVG shapes per section (ExperienceShapes, CreativeShapes, ContactShapes)
- `src/components/FloatingShapes.tsx` - Hero floating shape animations
- `src/components/BackgroundElements.tsx` - Fixed background grid/shapes
- `src/data/content.ts` - All site content (experiences, frameworks, installations)
- `src/data/thinking.ts` - Thought pieces content
- `src/lib/gsap.ts` - Centralized GSAP plugin registration (always import from here)

## Key Conventions
- **GSAP imports:** Always use `import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'` - never import gsap directly or re-register plugins
- **Reduced motion:** Every animation block must check `prefers-reduced-motion` and bail early
- **Lazy loading:** Below-fold sections use `React.lazy()` + `Suspense`
- **CSS variables:** Use `var(--color-grey-400)` etc. from index.css, not hardcoded colors
- **Font classes:** `font-display` (Mona Sans), `font-sans` (Geist), `font-mono` (Geist Mono)
- **Mobile:** All interactive elements have min 44px touch targets. Use responsive classes (sm/md/lg breakpoints)
- **SEO:** Static HTML fallback in index.html for crawlers. Structured data (JSON-LD Person schema)

## Performance Notes
- PostHog deferred via `requestIdleCallback` - not in critical path
- Creative section background images only mount when section approaches viewport (IntersectionObserver)
- FloatingShapes entrance animations complete before starting idle floating tweens
- Animated fixed elements use `will-change: transform` for GPU compositing
- Font preloads in index.html head for Mona Sans and Geist Regular

## File Naming
- Components: PascalCase (`FloatingShapes.tsx`)
- Data files: camelCase (`content.ts`)
- Section components live in `src/components/sections/`

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
