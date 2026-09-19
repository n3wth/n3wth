# AGENTS.md

Digital garden (personal wiki) built with Next.js 16 App Router. Contact: hey@n3wth.com

## Orientation

| Path | What it is |
|------|------------|
| `content/` | Garden notes (Obsidian-flavored markdown) — the source of truth |
| `src/` | Chrome: app code, components, plugins, theme |
| `../../packages/ui/src/theme/n3wthTheme.ts` | Shared Astryx theme — build the UI package after edits; import `@n3wth/ui/site` and `@n3wth/ui/site.css` |

Follow the existing design and plain-language copy. The heaviest font weight on this site is semibold (600).

Compliance, non-negotiable: site content and copy never name AI assistants, models, or their vendors. Before committing any new content or copy, search it for model and vendor names and remove them.

## Commands

```bash
npm run dev    # Dev server (port 3000)
npm run build  # Production build
```

`npm run typecheck` checks TypeScript. `npm run check` runs the Node tests in `scripts/*.test.mjs`, typecheck, and the production build.

From the repository root, run Garden browser checks with `npm exec -- playwright test --config playwright.garden.config.ts` after building Garden.

## Compliance (non-negotiable)

Keep site copy free of model and assistant brands. Max font weight: semibold (600).

---

## Architecture details

### Content Pipeline

1. `src/lib/content.ts` reads the generated content manifest, parses frontmatter, builds slug/title maps, and resolves `[[wikilinks]]`. Use `getPublishedNotes()` for reader-facing note collections.
2. `src/lib/note-links.mjs` owns Markdown preprocessing and wikilink matching. Rendering, graph links, and backlinks use the same rules. Code, removed titles, dataview blocks, and embeds do not create note connections.
3. `src/lib/markdown.ts` adds wikilink rendering and HTML conversion to the shared Markdown processor.
4. `src/lib/backlinks.ts` builds the reverse-link map. Context offsets refer to parsed paragraph text, so formatting and decoded entities do not shift the quoted mention.

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

- **Primitives** (`@n3wth/ui/primitives`) — native Astryx components exposed through the shared UI package. Do not add a direct Astryx dependency.
- **Theme** — `@n3wth/ui/site` supplies the shared Astryx provider, palette and typography; keep Source Serif 4 as the note-reading extension.
- **Tailwind v4** — coexists via `globals.css`; `@n3wth/ui/tailwind-theme.css` bridges tokens
- **React runtime compatibility** — normalized by the shared UI build; no application shim is needed.

### Conventions

- Path alias: `@/*` → `./src/*`
- Slugs: lowercased, special chars stripped, spaces → hyphens
- Frontmatter: `title`, `description`, `tags` (array), `date`, `draft` (boolean)
- Node 24 (`.nvmrc` and package engines pin the shared major version)
