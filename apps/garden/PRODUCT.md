# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

All three audiences are real and confirmed by the owner; no single one dominates:

1. **Friends and colleagues** who know Oliver and are curious what this site is and why it isn't a blog. They wander rather than search. `content/about.md` is written directly to them.
2. **Recruiters and professional peers** evaluating Oliver professionally. The career, leadership, and AI-product notes carry that weight; the garden framing is the differentiator.
3. **Oliver himself**, using the site as the public face of a working Obsidian vault — recall and thinking first.

A fourth, secondary audience arrives from search and lands deep on a single note, so individual notes must stand alone and earn a second click.

## Product Purpose

A digital garden: 260+ interconnected notes rendered from an Obsidian vault as a statically generated site. Unlike a blog, notes are explicitly unfinished and continuously tended. Success is a visitor following links between notes rather than reading one and leaving.

## Positioning

The garden is the interface, not a metaphor bolted onto a blog. Every note has a growth stage (seedling / budding / evergreen), a planted date, a last-tended date, and a link degree — and those facts drive the visual representation directly: the homepage renders each note as a light in a 3D world, and each note draws a plant whose height follows its stage and whose branches follow its link count. A neighboring "blog with a graph view" cannot truthfully claim this because the data model, not the styling, is what is being shown.

## Operating Context

- Content is authored in Obsidian and committed as markdown under `content/`; the vault is the source of truth and the site is a projection of it.
- Obsidian-flavored syntax is load-bearing: `[[wikilinks]]`, callouts, frontmatter (`title`, `description`, `tags`, `date`, `draft`, `audience`), dataview blocks (stripped at build).
- Backlinks are derived, not authored — a note's inbound links are computed by scanning every other note.
- Visitors arrive both at the root (wander mode) and deep on a note (search mode).
- Deployed on Vercel at garden.n3wth.com; sibling site n3wth.com shares the visual identity.

## Capabilities and Constraints

- Next.js 16 App Router, statically generated. Node >= 20.9.0.
- Surfaces: `/` (3D world), `/{slug}` (note), `/notes` (field guide index), `/tags` and `/tags/{tag}` (groves), `/graph`, `/world`, `/random`, `/feed.xml`, `/llms.txt`, `/sitemap.xml`, OG image routes.
- UI components come from Astryx (`@astryxdesign/core`); the theme is `src/theme/n3wthTheme.ts`, and `src/theme/n3wth-theme.css` is **generated** from it (`npx astryx theme build`) — never hand-edited.
- Prose styling is custom CSS in `src/app/globals.css`, not `@tailwindcss/typography`. Tailwind v4.
- No test runner and no linter are configured. `npm run build` is the only gate.
- Telemetry: Axiom (`next-axiom`) and PostHog web vitals, production only.
- Keep shipped site copy free of model and assistant brands.
- The 3D world homepage is a fixed product decision: it stays as the front door.

## Brand Commitments

- Name: newth.garden / garden.n3wth.com. Gardener: Oliver Newth, AI Product Leader, n3wth.com.
- Garden vocabulary is product terminology, not decoration: seedling, budding, evergreen; groves (tags); field guide (index); planted / tended (dates).
- Voice: plain, unhurried, first-person, no marketing language. Sentence case throughout. No emoji.
- Visual identity is shared with n3wth.com: near-black canvas (`#08090b`), grayscale ink ramp, white accent, hairline rails, Geist Sans / Geist Mono, heaviest weight semibold (600), flat surfaces by default.

## Evidence on Hand

- 260 markdown notes under `content/` — real, personally written, spanning careers, learning, gardening, cooking, home automation, travel, and reading.
- Derived data that is genuinely true and available to the UI: link graph (`src/lib/graph.ts`), backlinks (`src/lib/backlinks.ts`), per-note history (`src/data/content-history.json`), growth stage and plant geometry (`src/lib/plant.ts`).
- No testimonials, customers, benchmarks, pricing, or usage statistics exist. Future work must not fabricate any.

## Product Principles

1. **The garden data is the design.** Stage, age, tending recency, and link degree are real per-note facts; show them rather than inventing ornament.
2. **Unfinished is the point.** Never make a note look authoritative or complete when its stage says otherwise.
3. **Every note is an entry point.** A visitor landing deep must be able to orient and find a next link without going home first.
4. **Wandering beats searching.** Optimize for the second and third click, not the first read.
5. **Quiet surfaces, loud content.** The interface recedes; the notes and the world carry the expression.

## Accessibility & Inclusion

No product-specific standard has been established by the owner. The 3D homepage is the known risk surface: it must not be the only path to the content, and motion-sensitive visitors need a respected `prefers-reduced-motion`.
