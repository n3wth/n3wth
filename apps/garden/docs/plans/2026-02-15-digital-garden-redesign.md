# Digital Garden Redesign

## Goal

Transform garden.n3wth.com from a static markdown renderer into a compelling, explorable digital garden.

## Features (Approach A: Essential Garden)

### 1. Interactive Graph View

**Local graph** on every note page showing 1-2 degrees of connections. **Full graph** on a dedicated `/graph` page. D3.js force-directed layout. Nodes colored by tag cluster. Current note highlighted. Click to navigate.

Data: Build a JSON graph at build time from the existing wikilink/backlink data in `content.ts` and `backlinks.ts`. Expose via a static JSON file or inline script.

### 2. Hover Link Previews

When hovering an `.internal-link`, show a popover with: note title, first ~150 chars of content, tags, and growth stage. Delay 300ms to avoid accidental triggers. Dismiss on mouse leave.

Data: Build a preview map at build time (slug -> { title, excerpt, tags, stage }). Load as JSON.

### 3. Growth Stage Indicators

Three stages: seedling, budding, evergreen. Indicated by a small inline SVG icon + label next to the note title and in metadata. Auto-classify based on content length and structure:
- **Seedling**: < 200 words or < 2 headings
- **Budding**: 200-800 words or 2-5 headings
- **Evergreen**: > 800 words and > 5 headings

Override via frontmatter `stage: seedling|budding|evergreen`.

### 4. Redesigned Homepage

Replace the static README-style homepage with:
- Hero section: garden name, brief tagline, garden stats (note count, link count, tag count)
- "Recently tended" cards (notes sorted by file mtime, show title + excerpt + stage + tags)
- "Explore" section with topic clusters (top-level folders as entry points)
- Random note button
- Mini graph visualization

### 5. GSAP Scroll Animations

- Page entrance: title and metadata fade-up with stagger
- Scroll reveals: cards and sections animate in on scroll (ScrollTrigger batch)
- Graph: nodes fade in with stagger on mount
- Respect `prefers-reduced-motion`

### Quick Wins

- **Random note button** in navigation
- **Weighted tag cloud** on /tags (font size proportional to note count)
- **Fix stale Obsidian references** in content files (Notes page Graph/Explorer/Sidebar text)

## Tech Stack

- D3.js for graph (new dependency)
- `@gsap/react` for animation hooks (gsap already installed)
- Existing `@n3wth/ui` components (Card, Badge, Tooltip, useScrollReveal)
- All new components are client components (`'use client'`)
- Graph data and preview data generated at build time in `src/lib/`

## Out of Scope

- Search (future iteration)
- Sidenotes
- Stacked/sliding panes
- Mobile TOC
- Breadcrumbs (already partially exist)
