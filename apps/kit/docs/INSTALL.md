# Installing @n3wth/kit Components

[@n3wth/kit](https://kit.n3wth.com) is a shadcn-compatible component registry with 49 components, hooks, and blocks.

## Quick Start

Once `@n3wth` is listed in the official shadcn registry index, install components with:

```bash
npx shadcn add @n3wth/<component-name>
```

Until then, use the direct URL:

```bash
npx shadcn add https://kit.n3wth.com/r/<component-name>.json
```

## Registry URL

```
https://kit.n3wth.com/r/registry.json
```

## Available Components

### Style

| Name | Description |
|------|-------------|
| `n3wth` | Flat, minimal, iOS-inspired design system base style |

### Library

| Name | Description |
|------|-------------|
| `cn` | Tailwind CSS class merge utility (clsx + tailwind-merge) |

### UI Components

| Name | Description |
|------|-------------|
| `accordion` | Accessible accordion with single/multiple modes and animated content |
| `animated-text` | CSS-animated text with fade-up, fade-in, slide-up, and blur-in effects |
| `avatar` | Circular avatar with image, fallback initials, and size presets |
| `badge` | Inline badge with semantic color variants (sage, coral, mint, gold) |
| `button` | Multi-variant button with responsive sizes, loading state, and asChild support |
| `card` | Card container with default, glass, and interactive variants |
| `character` | Expressive SVG character face with expressions and accessories |
| `code-block` | Lightweight syntax-highlighting code block with line numbers |
| `command-box` | Copyable command display box with clipboard support |
| `composite-shape` | Multi-layer shape compositions with preset configurations |
| `dropdown` | Accessible dropdown select with single/multi-select and search |
| `error-boundary` | React error boundary with fallback UI and retry |
| `hamburger-icon` | Animated hamburger-to-X SVG icon for mobile menu toggles |
| `icon` | Icon wrapper around iconoir-react with named icon map and size presets |
| `input` | Text input with glass variant, icon slots, and error state |
| `label` | Form label with required indicator and disabled state |
| `mobile-drawer` | Slide-in drawer for mobile navigation with focus trap |
| `modal` | Accessible modal dialog with portal, focus trap, and compound sub-components |
| `nav-link` | Navigation link with default, underline, and pill variants |
| `noise-overlay` | SVG noise texture overlay for visual grain effect |
| `progress` | Animated progress bar with value label and semantic color states |
| `scroll-indicator` | Animated scroll-down indicator with label and position presets |
| `separator` | Horizontal or vertical visual separator |
| `shape` | Decorative SVG shape with pattern fills and responsive sizing |
| `skeleton` | Skeleton loading placeholder with text, circular, and rectangular variants |
| `speech-bubble` | Speech or thought bubble with directional tail |
| `switch` | Toggle switch with controlled/uncontrolled modes and size variants |
| `tabs` | Accessible tabs with underline and pill variants and animated indicator |
| `textarea` | Textarea with resize control and error state |
| `theme-toggle` | Dark/light theme toggle button with sun/moon icons |
| `toast` | Toast notification with variant styling and auto-dismiss |
| `tooltip` | Portal-based tooltip with auto-positioning and arrow |

### Blocks

| Name | Description |
|------|-------------|
| `footer` | Site footer with link columns, social icons, and copyright |
| `hero` | Hero section with badge, title, description, and CTA buttons |
| `nav` | Responsive navigation bar with desktop links, mobile drawer, and theme toggle |
| `section` | Layout section wrapper with size, spacing, and container options |

### Hooks

| Name | Description |
|------|-------------|
| `use-button-pulse` | Subtle hover/press scale animations for buttons |
| `use-count-up` | Animated number counter with scroll-trigger support |
| `use-keyboard-shortcuts` | Declarative keyboard shortcut handler with modifier key support |
| `use-media-query` | SSR-safe media query matching with breakpoint helpers |
| `use-page-transition` | Page entrance/exit fade-and-slide animations |
| `use-reduced-motion` | Detects prefers-reduced-motion and provides animation config defaults |
| `use-scroll-reveal` | Scroll-triggered entrance animations with directional options |
| `use-stagger-list` | Staggered list item cascade animations |
| `use-text-reveal` | Character-by-character text reveal with scroll trigger |
| `use-theme` | Theme toggle with localStorage persistence and system preference detection |
| `use-toast` | Toast notification system with context provider and variant helpers |

## Examples

Install a single component:

```bash
npx shadcn add @n3wth/button
```

Install multiple components:

```bash
npx shadcn add @n3wth/button @n3wth/card @n3wth/input
```

Install a block with its dependencies:

```bash
npx shadcn add @n3wth/hero
```

Install a hook:

```bash
npx shadcn add @n3wth/use-theme
```

## AI Context Packs

@n3wth/kit ships context packs for AI coding assistants. These files help AI tools understand the component APIs and design patterns.

### Available Context Packs

| File | Target | Purpose |
|------|--------|---------|
| `cursorrules` | Cursor | Natural language instructions and component catalog |
| `AGENTS.md` | AI coding tools | Component API reference with props and patterns |
| `mcp.json` | Any MCP client | MCP server config for direct registry access |
| `components.json` | Programmatic / any AI | Structured JSON with props, usage, and a11y notes |

### Setup

Download from https://kit.n3wth.com/ai/ or copy from the [public/ai](https://github.com/n3wth/kit/tree/main/public/ai) directory.

**Cursor:**

```bash
curl -o .cursorrules https://kit.n3wth.com/ai/cursorrules
```

**AGENTS.md:**

```bash
curl -o AGENTS.md https://kit.n3wth.com/ai/AGENTS.md
```

**MCP (Cursor, Windsurf, etc.):**

```bash
# Cursor
mkdir -p .cursor && curl -o .cursor/mcp.json https://kit.n3wth.com/ai/mcp.json

# Other MCP clients
mkdir -p .mcp && curl -o .mcp/mcp.json https://kit.n3wth.com/ai/mcp.json
```

## Design System

Components use a flat, minimal, iOS-inspired design with:

- No shadows or gradients (unless explicitly specified)
- Rounded corners and glassmorphism via backdrop-blur
- Dark-first palette with light mode support
- CSS custom properties for theming
- Tailwind v4 compatibility

## Requirements

- React 18+
- Tailwind CSS v4
- shadcn CLI (`npx shadcn@latest`)

## Links

- **Registry**: https://kit.n3wth.com/r/registry.json
- **Website**: https://kit.n3wth.com
- **AI Context Packs**: https://kit.n3wth.com/ai/
