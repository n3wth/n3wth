# Skills catalog

Follow the root [AGENTS.md](../../AGENTS.md), [DESIGN.md](../../DESIGN.md), and [STYLE.md](../../STYLE.md). Installation instructions belong in [README.md](README.md).

## Add or update a skill

- Add the catalog entry to `src/data/skills.ts`. Its `Skill` type is the schema; use existing entries as examples.
- Category and assistant IDs come from `src/config/categories.ts` and `src/config/assistants.ts`.
- Optional downloadable instructions live in `skills/<id>.md` or `skills/<id>/SKILL.md`. Include `name` and `description` in YAML frontmatter, then triggers, instructions, and an example.
- Keep catalog IDs and download paths aligned. Entries without downloadable content remain marked unavailable.

Run `npm run check --workspace @n3wth/skills` from the repository root. The installer and browser suites are defined in this app's `package.json`.
