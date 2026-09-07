# AGENTS.md

Digital garden (personal wiki) built with Next.js 16 App Router. Contact: hey@n3wth.com

## Orientation

| Path | What it is |
|------|------------|
| `content/` | Garden notes (Obsidian-flavored markdown) — the source of truth |
| `src/` | Chrome: app code, components, plugins, theme |
| `src/theme/n3wthTheme.ts` | Astryx theme definition — regenerate CSS after edits: `npx astryx theme build src/theme/n3wthTheme.ts -o src/theme/n3wth-theme.css` |

Follow the existing design and plain-language copy. The heaviest font weight on this site is semibold (600).

Compliance, non-negotiable: site content and copy never name AI assistants, models, or their vendors. Before committing any new content or copy, search it for model and vendor names and remove them.

## Commands

```bash
npm run dev    # Dev server (port 3000)
npm run build  # Production build
```

`npm run typecheck` checks TypeScript. `npm run check` runs typecheck and the production build. No test runner or linter configured.

## Compliance (non-negotiable)

Keep site copy free of model and assistant brands. Max font weight: semibold (600).

---

## Architecture details

### Content Pipeline

1. `src/lib/content.ts` — scans `content/`, parses frontmatter, builds slug/title maps, resolves `[[wikilinks]]`. Ignored dirs: `Attachments`, `space`, `space 1`, `Tags`.
2. `src/lib/markdown.ts` — unified pipeline: remarkParse → remarkGfm → custom plugins → remarkRehype → HTML.
3. `src/lib/backlinks.ts` — builds reverse-link map for backlinks.

### Remark Plugins (`src/plugins/`)

- `remark-wikilinks` — `[[Target]]` and `[[Target|Alias]]` → internal links
- `remark-callouts` — `> [!type]` → styled callout blocks
- `remark-strip-dataview` — removes dataview code blocks
- `remark-strip-title` — strips first H1 (title rendered by page component)

### Routing

- `/` → `content/index.md`
- `/{slug}` → any note via `src/app/[...slug]/page.tsx`
- `/tags`, `/tags/{tag}` → tag listings

### Styling

- **Astryx** (`@astryxdesign/core`) — UI components. Docs: `npx astryx docs`
- **Theme** — `src/theme/n3wthTheme.ts` mirrors `@n3wth/ui` palette (near-black `#08090b` canvas, grayscale ink, white accent, Geist fonts)
- **Tailwind v4** — coexists via `globals.css`; `@astryxdesign/core/tailwind-theme.css` bridges tokens
- **jsx-dev-runtime shim** — `next.config.ts` aliases for Astryx compatibility with React 19 prod

### Conventions

- Path alias: `@/*` → `./src/*`
- Slugs: lowercased, special chars stripped, spaces → hyphens
- Frontmatter: `title`, `description`, `tags` (array), `date`, `draft` (boolean)
- Node 24 (`.nvmrc` and package engines pin the shared major version)
