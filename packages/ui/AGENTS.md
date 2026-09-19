# @n3wth/ui - Agent Instructions

## Workspace

This package was imported from n3wth/ui at 62839d33ae0a439901b9515339e6259ce6dcf274. Starting with 2.0.0, this monorepo is the publishing authority. Push a `v<version>` tag on main to run .github/workflows/publish-ui.yml; never publish locally. See ../../docs/workspace/npm-release.md. UI docs lives in apps/ui-docs; use root workspace commands and the root lockfile. Validate with npm run check --workspace @n3wth/ui and npm run check:package. See SOURCE.md for historical provenance.

## Overview

### Current workspace architecture

Sites → `@n3wth/ui` → Astryx. The UI package owns the pinned Astryx dependency and React runtime normalization. Native control APIs are exposed through `@n3wth/ui/primitives`; shared brand/page compositions use `@n3wth/ui/site`. `site.css` includes fonts, generated theme and component styles; `tailwind-theme.css` exposes the token bridge. Applications must not import Astryx directly.

Prefer these entries for new work. Root component exports are compatibility adapters and brand utilities. The historical Nav/Hero/Footer/Section examples below describe their retained props, not the current recommended site API. All four delegate to the shared site compositions. See `../../docs/workspace/design-system.md` for the current design and workflow; its flat surfaces, Suisse Intl headings and body, minimal footers and immediate navigation supersede historical visual guidance below.

Flat, minimal design system for n3wth projects. Built on Tailwind CSS 4 with aesthetics inspired by iOS.

## Installation

```bash
npm install @n3wth/ui
```

```tsx
import '@n3wth/ui/styles'
```

## Key Components

### Nav

Fixed navigation bar with behavior that hides it on scroll. Used across n3wth, skills, and ui sites.

```tsx
import { Nav } from '@n3wth/ui'

<Nav
  logo="n3wth"
  logoHref="/"
  items={[
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'GitHub', href: 'https://github.com/n3wth', external: true },
  ]}
  fixed           // Position fixed at top
  hideOnScroll    // Hide on scroll down, show on scroll up
  showThemeToggle // Show theme toggle (requires onThemeToggle)
  theme="dark"
  onThemeToggle={() => {}}
/>
```

**Props:**
- `logo` - ReactNode for the logo
- `logoHref` - Link for logo click (default: "/")
- `items` - Array of `{ label, href, isActive?, external? }`
- `fixed` - Fixed position at top
- `hideOnScroll` - Smooth visibility based on scroll
- `theme` - "dark" | "light"
- `onThemeToggle` - Theme toggle callback
- `showThemeToggle` - Show/hide theme toggle (default: true)

**Alignment:** Nav content uses `max-w-6xl mx-auto px-6 md:px-12` on the inner container. Ensure your page sections use the same padding pattern for alignment.

### Tailwind v4 Integration

When using @n3wth/ui components, add the `@source` directive to scan component classes:

```css
@import 'tailwindcss';
@import '@n3wth/ui/styles';

/* Required: scan @n3wth/ui for Tailwind classes */
@source "../node_modules/@n3wth/ui/dist";
```

### CSS Custom Properties

Components use CSS variables for theming. Define these in your `:root`:

```css
:root {
  --color-bg: #000000;
  --color-white: #ffffff;
  --color-grey-400: #86868b;
  --color-accent: #ffffff;
}
```

The `@n3wth/ui/styles` import provides default values.

## Component Patterns

### Container Alignment

All sections should use consistent container styling:

```tsx
// Page section - padding on inner container to match Nav/Footer
<div className="mx-auto max-w-6xl px-6 md:px-12">
  {/* Content */}
</div>

// Nav handles this internally
<Nav fixed hideOnScroll ... />
```

### Theme Toggle

```tsx
import { Nav, useTheme } from '@n3wth/ui'

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Nav
      theme={theme}
      onThemeToggle={toggleTheme}
      // ...other props
    />
  )
}
```

## File Structure

```
src/
├── atoms/          # Button, Badge, Input, Icon, etc.
├── molecules/      # Card, NavLink, ThemeToggle, MobileDrawer
├── organisms/      # Nav, Hero, Section, Footer
├── hooks/          # useTheme, useMediaQuery, useReducedMotion
├── tokens/         # Design tokens (colors, typography, spacing)
└── styles.css      # Global styles and CSS custom properties
```

## Common Issues

### Nav items not visible
Add `@source` directive to scan @n3wth/ui classes (see Tailwind v4 Integration above).

### Colors showing as black
Ensure `:root` CSS custom properties are defined, or import `@n3wth/ui/styles`.

### Misaligned content
Use matching container constraints: `max-w-6xl mx-auto px-6 md:px-12`

## Deployment

### Publishing

Publishing is automated via GitHub Actions. Do NOT use `npm publish` locally.

In one PR, bump `version` in `package.json`, set the same version in the
starter's `@n3wth/ui` dependency, and add a CHANGELOG.md entry. Merge after
Site CI passes. Push a `v<version>` tag on the merge commit. Publish
checks the package, validates the packed consumer, and publishes that exact
tarball through npm trusted publishing.

### Demo Site (Vercel)

The docs site at https://ui.n3wth.com deploys manually from the monorepo.

- **Project:** Existing ui project, root apps/ui-docs in n3wth/n3wth
- **Build:** Root npm run build:ui-docs
- **Deployments:** Manual; package release does not deploy sites

### Consumers

Apps in this monorepo declare `"@n3wth/ui": "*"` and always consume the
workspace copy, so no consumer update is needed after publishing. Only the
starter template at `packages/ui/v0/n3wth-ui` pins the exact release version.

## Open Graph Card

Shared OG image template for n3wth sites. Works with Next.js `opengraph-image.tsx`:

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { OGCard } from '@n3wth/ui/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(<OGCard title="My Site" />, size)
}
```

Black background, white type, n3wth mark. 1200x630, Twitter `summary_large_image` compatible.

## Version History

- **v0.5.3** - Dependency updates
- **v0.5.2** - Consistent width alignment (Nav, Footer, content all use max-w-6xl px-6 md:px-12)
- **v0.5.0** - Nav hideOnScroll, alignment fixes, solid background
- **v0.4.x** - Initial Nav component, NavLink variants
- **v0.3.x** - Hero, Section, Footer organisms
