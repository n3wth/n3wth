# n3wth/garden

A digital garden of interconnected notes on careers, learning, health, and building things. Built with Next.js 16 App Router, rendering Obsidian-flavored markdown from the `content/` directory.

Live at [garden.n3wth.com](https://garden.n3wth.com)

## Development

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm start            # Serve production build
```

Requires Node >= 20.9.0 (`.nvmrc` pins 22).

## Architecture

Markdown files in `content/` are the source of truth. The pipeline parses frontmatter, resolves `[[wikilinks]]`, converts Obsidian callouts, and builds backlinks. Notes are statically generated at build time.

See `AGENTS.md` for detailed architecture documentation.

## Contact

hey@n3wth.com
