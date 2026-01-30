# newthai Project Index

## Project Overview

**Name:** Oliver Newth Portfolio
**Type:** React SPA (Single Page Application)
**Framework:** Vite 7 + React 19 + TypeScript
**Styling:** Tailwind CSS 4 + @n3wth/ui
**Animations:** GSAP 3.14 (SplitText, ScrollTrigger) + Lenis
**Domain:** newth.ai

Personal portfolio website for Oliver Newth, AI Product Leader at Google. Features work experience, product philosophy frameworks, and LED art installations with heavily animated scroll-driven interactions.

## Tech Stack

| Category | Technology |
|----------|------------|
| Build Tool | Vite 7.2 |
| Framework | React 19.2 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4.1 |
| UI Components | @n3wth/ui 0.2 |
| Animations | GSAP 3.14 + @gsap/react 2.1 |
| Smooth Scroll | Lenis 1.3 |
| Routing | React Router DOM 7.13 |
| Fonts | Mona Sans (variable), Geist Sans, Geist Mono |

## Directory Structure

```
newthai/
├── src/
│   ├── App.tsx                 # Root component with section composition
│   ├── main.tsx                # Entry point
│   ├── index.css               # Full CSS with design tokens, fonts
│   ├── components/
│   │   ├── Nav.tsx             # Navigation with GSAP ScrollTrigger
│   │   ├── Footer.tsx          # Site footer
│   │   ├── SmoothScroll.tsx    # Lenis smooth scrolling wrapper
│   │   ├── BackgroundElements.tsx  # Decorative background
│   │   ├── NoiseOverlay.tsx    # Texture overlay
│   │   └── sections/
│   │       ├── Hero.tsx        # SplitText character animation
│   │       ├── Experience.tsx  # Horizontal scroll work history
│   │       ├── Frameworks.tsx  # Product philosophy cards
│   │       ├── Creative.tsx    # LED art installations
│   │       ├── Contact.tsx     # Contact section
│   │       └── index.ts        # Section exports
│   └── data/
│       └── content.ts          # Site config, experiences, installations
├── public/                     # Static assets
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── claudedocs/                 # Claude documentation
```

## Architecture

### Component Composition

```
App.tsx
├── SmoothScroll (Lenis wrapper)
│   ├── BackgroundElements
│   ├── NoiseOverlay
│   ├── Nav
│   └── main
│       ├── Hero
│       ├── Experience
│       ├── Frameworks
│       ├── Creative
│       └── Contact
└── Footer
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `SmoothScroll.tsx` | Lenis integration with GSAP ticker sync |
| `Nav.tsx` | Fixed navigation with scroll-triggered visibility |
| `Hero.tsx` | Name reveal with SplitText character animation |
| `Experience.tsx` | Horizontal scrolling work history (pinned section) |
| `Frameworks.tsx` | Product philosophy framework cards |
| `Creative.tsx` | LED art installations with parallax backgrounds |
| `Contact.tsx` | Contact information and links |

## Animation System

### GSAP Integration

The project uses GSAP with official React hooks (`@gsap/react`) and plugin registration.

**Registered Plugins:**
- `ScrollTrigger` - Scroll-driven animations
- `SplitText` - Text character/word/line splitting

### Key Animation Patterns

#### Hero Character Animation (`Hero.tsx`)

```typescript
splitRef.current = new SplitText(titleRef.current, {
  type: 'chars',
  charsClass: 'hero-char',
})

// 3D rotation reveal
tl.fromTo(chars,
  { y: 100, opacity: 0, rotateX: -90 },
  { y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: 'power3.out', stagger: { amount: 0.6 } }
)
```

#### Horizontal Scroll (`Experience.tsx`)

```typescript
const horizontalScroll = gsap.to(track, {
  x: -scrollDistance,
  ease: 'power1.inOut',
  scrollTrigger: {
    trigger: containerRef.current,
    start: 'top top',
    end: () => `+=${scrollDistance * 1.2}`,
    pin: true,
    scrub: 1.5,
  },
})

// Cards use containerAnimation for linked scroll
gsap.fromTo(card, { opacity: 0, y: 50 }, {
  opacity: 1, y: 0, duration: 0.8,
  scrollTrigger: {
    trigger: card,
    containerAnimation: horizontalScroll,
    start: 'left 80%',
    toggleActions: 'play none none reverse',
  },
})
```

#### Lenis Smooth Scroll (`SmoothScroll.tsx`)

```typescript
lenisRef.current = new Lenis({
  duration: 0.8,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

lenisRef.current.on('scroll', ScrollTrigger.update)
gsap.ticker.add(rafCallbackRef.current)
gsap.ticker.lagSmoothing(0)
```

## Data Models

### Site Configuration (`src/data/content.ts`)

```typescript
export const siteConfig = {
  name: 'Oliver Newth',
  title: 'Oliver Newth - AI Product Leader',
  description: 'AI safety and Trust & Safety at billion-user scale. Google I/O speaker.',
  email: 'oliver@newth.ai',
  social: {
    linkedin: string,
    twitter: string,
    github: string,
  }
}
```

### Experience Data

```typescript
interface Experience {
  company: string
  role: string
  period: string
  description: string
  highlights: string[]
  logo?: string
}
```

**Companies:**
1. **Google** - AI Product Leader, Trust & Safety
2. **Covariant** - Product Lead, AI Robotics
3. **Meta** - Product Manager, Content Moderation
4. **Microsoft** - Program Manager, Azure

### Frameworks Data

Product philosophy principles displayed as interactive cards.

### Installations Data

```typescript
interface Installation {
  name: string
  year: string
  location: string
  description: string
  image?: string
}
```

**LED Art Installations:**
1. **Pink Triangle** - Castro District SF memorial
2. **THEM** - Interactive light installation
3. **Circle of Light** - Collaborative light art

## Design System

### Typography

| Font | Usage | Source |
|------|-------|--------|
| Mona Sans | Headings, display | Variable font (local) |
| Geist Sans | Body text | Google Fonts-style |
| Geist Mono | Code, numbers | Monospace alternative |

### Color Palette (Dark Theme)

```css
:root {
  --color-bg: #000000;
  --color-surface: rgba(255, 255, 255, 0.05);
  --color-text: #ffffff;
  --color-text-muted: rgba(255, 255, 255, 0.6);
  --color-accent: /* primary accent */
  --color-border: rgba(255, 255, 255, 0.1);
}
```

### Glass Morphism

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## Accessibility

### Reduced Motion Support

All animations check for `prefers-reduced-motion`:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // Skip or simplify animations
  return
}
```

### Semantic Structure

- Proper heading hierarchy (h1 for name, h2 for sections)
- `main` landmark for primary content
- `nav` element for navigation
- `footer` element for footer content

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | UI framework |
| react-dom | 19.2.0 | React DOM renderer |
| react-router-dom | 7.13.0 | Client-side routing |
| gsap | 3.14.2 | Animation library |
| @gsap/react | 2.1.2 | GSAP React integration |
| lenis | 1.3.17 | Smooth scroll library |
| @n3wth/ui | 0.2.2 | Custom component library |
| tailwind-merge | 3.2.0 | Tailwind class merging |
| clsx | 2.1.1 | Conditional classNames |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| vite | 7.2.0 | Build tool |
| typescript | 5.8.3 | Type checking |
| tailwindcss | 4.1.10 | CSS framework |
| @vitejs/plugin-react | 4.5.2 | Vite React plugin |
| eslint | 9.28.0 | Code linting |

## Performance Considerations

1. **Smooth Scroll Sync**: Lenis updates are synced with GSAP ticker for consistent frame timing
2. **ScrollTrigger Pinning**: Experience section uses pinning for horizontal scroll effect
3. **Character Animation**: SplitText creates individual elements per character for fine-grained control
4. **Lag Smoothing**: Disabled via `gsap.ticker.lagSmoothing(0)` for smoother animations
5. **Reduced Motion**: Respects user preferences by disabling complex animations

## Project Characteristics

### Compared to grosvenornewth

| Feature | newthai | grosvenornewth |
|---------|---------|----------------|
| Owner | Oliver Newth (AI Product Leader) | Edward Grosvenor-Newth (Marketing Student) |
| React Version | 19.2 | 18.3 |
| Vite Version | 7.2 | 5.4 |
| UI Library | @n3wth/ui | shadcn/ui |
| Smooth Scroll | Lenis | None |
| Animation Focus | Heavy GSAP (SplitText, horizontal scroll) | GSAP + Framer Motion |
| AI Features | None | Gemini chat + ElevenLabs TTS |
| Theme | Dark only | Light with dark elements |
| Routing | Minimal (single page) | Multi-page (projects, about, contact) |
