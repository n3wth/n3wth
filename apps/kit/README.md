# n3wth/kit

Component registry for the n3wth design system.

Components with built-in context packs so AI tools generate on-brand code instead of generic shadcn output.

[**Browse components**](https://kit.n3wth.com/components) | [**Docs**](https://kit.n3wth.com/docs) | [**Blog**](https://kit.n3wth.com/blog)

---

## The problem

You install shadcn/ui. You add a `.cursorrules` file. You prompt an AI to build a feature. It generates valid React, but it looks nothing like your product. Wrong colors, wrong spacing, wrong component patterns. You spend 30 minutes fixing what should have taken 30 seconds.

This happens because AI tools don't know your design system. They know shadcn defaults.

## What kit does

kit is a shadcn-compatible registry that ships every component with machine-readable context:

- **Design tokens** - CSS variables your AI tools can read and apply
- **AI context packs** - `.cursorrules`, `AGENTS.md`, and MCP config that teach Cursor, Windsurf, v0, Lovable, and other AI tools what "on-brand" means for your project
- **Usage rules** - Props, patterns, and accessibility notes in structured JSON that LLMs consume directly

The result: AI-generated code that matches your design system on the first try.

---

## Quick start

Install the design system base (required for CSS variables):

```bash
npx shadcn add https://kit.n3wth.com/r/n3wth.json
```

Install any component:

```bash
npx shadcn add https://kit.n3wth.com/r/button.json
```

---

## AI tool setup

### Cursor

```bash
curl -o .cursorrules https://kit.n3wth.com/ai/cursorrules
```

### AGENTS.md

```bash
curl -o AGENTS.md https://kit.n3wth.com/ai/AGENTS.md
```

### MCP (Cursor, Windsurf, etc.)

Add to your MCP client config:

```json
{
  "mcpServers": {
    "n3wth-kit": {
      "command": "npx",
      "args": ["-y", "shadcn@latest", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "https://kit.n3wth.com/r/registry.json"
      }
    }
  }
}
```

---

## Components

49 components across atoms, molecules, blocks, hooks, and visual utilities.

### Atoms (12)

| Component | Description | Install |
|-----------|-------------|---------|
| Button | Multi-variant, loading state, asChild | `npx shadcn add https://kit.n3wth.com/r/button.json` |
| Badge | Semantic color variants (sage, coral, mint, gold) | `npx shadcn add https://kit.n3wth.com/r/badge.json` |
| Input | Glass variant, icon slots, error state | `npx shadcn add https://kit.n3wth.com/r/input.json` |
| Icon | iconoir-react wrapper with size presets | `npx shadcn add https://kit.n3wth.com/r/icon.json` |
| Switch | Controlled/uncontrolled, size variants | `npx shadcn add https://kit.n3wth.com/r/switch.json` |
| Avatar | Image, fallback initials, size presets | `npx shadcn add https://kit.n3wth.com/r/avatar.json` |
| Label | Form label with required indicator | `npx shadcn add https://kit.n3wth.com/r/label.json` |
| Textarea | Resize control, error state | `npx shadcn add https://kit.n3wth.com/r/textarea.json` |
| Separator | Horizontal or vertical | `npx shadcn add https://kit.n3wth.com/r/separator.json` |
| Progress | Animated bar, semantic color states | `npx shadcn add https://kit.n3wth.com/r/progress.json` |
| Skeleton | Text, circular, rectangular variants | `npx shadcn add https://kit.n3wth.com/r/skeleton.json` |
| Tooltip | Portal-based, auto-positioning, arrow | `npx shadcn add https://kit.n3wth.com/r/tooltip.json` |

### Molecules (11)

| Component | Description | Install |
|-----------|-------------|---------|
| Card | Default, glass, interactive variants | `npx shadcn add https://kit.n3wth.com/r/card.json` |
| Modal | Portal, focus trap, compound sub-components | `npx shadcn add https://kit.n3wth.com/r/modal.json` |
| Tabs | Underline and pill variants, animated indicator | `npx shadcn add https://kit.n3wth.com/r/tabs.json` |
| Toast | Auto-dismiss, variant styling | `npx shadcn add https://kit.n3wth.com/r/toast.json` |
| Dropdown | Single/multi-select, search | `npx shadcn add https://kit.n3wth.com/r/dropdown.json` |
| Accordion | Single/multiple mode, animated | `npx shadcn add https://kit.n3wth.com/r/accordion.json` |
| Command Box | Copyable command display | `npx shadcn add https://kit.n3wth.com/r/command-box.json` |
| Theme Toggle | Dark/light with sun/moon icons | `npx shadcn add https://kit.n3wth.com/r/theme-toggle.json` |
| Code Block | Syntax highlighting, line numbers | `npx shadcn add https://kit.n3wth.com/r/code-block.json` |
| Mobile Drawer | Slide-in nav, focus trap | `npx shadcn add https://kit.n3wth.com/r/mobile-drawer.json` |
| Noise Overlay | SVG grain texture | `npx shadcn add https://kit.n3wth.com/r/noise-overlay.json` |

### Blocks (4)

| Component | Description | Install |
|-----------|-------------|---------|
| Nav | Responsive bar, mobile drawer, theme toggle | `npx shadcn add https://kit.n3wth.com/r/nav.json` |
| Hero | Badge, title, description, CTA buttons | `npx shadcn add https://kit.n3wth.com/r/hero.json` |
| Section | Layout wrapper with size and spacing options | `npx shadcn add https://kit.n3wth.com/r/section.json` |
| Footer | Link columns, social icons, copyright | `npx shadcn add https://kit.n3wth.com/r/footer.json` |

### Hooks (11)

| Hook | Description |
|------|-------------|
| `use-theme` | localStorage persistence, system preference detection |
| `use-media-query` | SSR-safe breakpoint matching |
| `use-reduced-motion` | prefers-reduced-motion with animation config defaults |
| `use-keyboard-shortcuts` | Declarative shortcut handler with modifier keys |
| `use-toast` | Toast context provider and variant helpers |
| `use-count-up` | Animated number counter with scroll trigger |
| `use-scroll-reveal` | Scroll-triggered entrance animations |
| `use-stagger-list` | Staggered cascade animations |
| `use-page-transition` | Page entrance/exit fade-and-slide |
| `use-text-reveal` | Character-by-character text reveal |
| `use-button-pulse` | Hover/press scale animations |

### Visual / decorative

`animated-text`, `character`, `composite-shape`, `hamburger-icon`, `nav-link`, `scroll-indicator`, `shape`, `speech-bubble`

---

## vs plain shadcn/ui

| | shadcn/ui | n3wth/kit |
|---|---|---|
| Component primitives | Yes | Yes (extended) |
| shadcn registry protocol | Yes | Yes |
| Design tokens | Defaults only | Custom system |
| AI context packs | No | Yes |
| Machine-readable usage rules | No | Yes |
| MCP server support | No | Yes |
| Animation hooks (GSAP) | No | Yes |
| Install command | `npx shadcn add` | `npx shadcn add` (same) |

kit is additive - same install protocol, works with any shadcn-compatible toolchain.

---

## Example: what changes

Without kit, prompting an AI gives you shadcn defaults:

```tsx
// Generic output - wrong colors, wrong radius, wrong feel
<Button className="bg-blue-500 hover:bg-blue-600 rounded-md">
  Get started
</Button>
```

With kit's context pack loaded, the same prompt gives you:

```tsx
// On-brand output - correct tokens, correct patterns
<Button variant="primary" size="md">
  Get started
</Button>
```

Same prompt. Different context. Your design system, first try.

---

## Tech stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 with CSS variables
- Radix UI primitives
- shadcn registry protocol
- GSAP animations

---

## Development

```bash
npm install
npm run dev              # Start dev server at localhost:3000
npm run registry:build   # Build registry JSON to public/r/
npm run build            # Build everything
```

Registry items live in `registry/new-york/[name]/`. Each item has a `.tsx` source and is declared in `registry.json`, then built to `public/r/[name].json`.

---

## License

MIT
