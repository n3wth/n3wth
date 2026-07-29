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

## Design
- Before any visual/design work, load `.claude/skills/frontend-design/SKILL.md` (Anthropic) and `.claude/skills/hallmark/SKILL.md` (anti-AI-slop design) and design against both.
- Before writing or editing any user-facing copy, load `.claude/skills/anti-ai-slop-writing/SKILL.md` and follow its constraints (banned vocabulary, no detectable AI patterns).
- Weights: this site's heaviest font weight is semibold (600) — never use bold/700.

## Key Conventions
- **GSAP imports:** Always use `import { gsap, useGSAP } from '../../lib/gsap'` - never import gsap directly or re-register plugins. Scroll-driven pieces import `{ gsap, useGSAP, ScrollTrigger, SplitText }` from `src/lib/scroll.ts` instead (registers scroll plugins once, ships in a lazy `gsap-scroll` chunk). Official GSAP skills are vendored in `.claude/skills/gsap-*` - load the relevant ones before writing animation code
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
