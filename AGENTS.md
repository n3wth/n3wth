# AGENTS.md

## Cursor Cloud specific instructions

This is a **React + TypeScript SPA** (personal portfolio site) built with Vite 7, Tailwind CSS 4, and GSAP for scroll-driven animations. No backend, no database.

### Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (Vite, default port 5173) |
| Lint | `npm run lint` (ESLint 9, flat config) |
| Build | `npm run build` (runs `tsc -b && vite build`) |
| Preview prod build | `npm run preview` |

### Notes

- There are **no automated tests** configured in this project (no test runner or test files).
- The `@n3wth/ui` package is a custom component library fetched from the npm registry; no special auth is needed.
- GSAP animations are scroll-driven; manual browser testing is needed to verify animation behavior.
- When running the dev server in a headless/cloud environment, use `--host 0.0.0.0` to bind to all interfaces: `npm run dev -- --host 0.0.0.0`.

### Copy and diagram taste (Thinking pieces, learned from direct user feedback)

- Never end a sentence on a mirrored "X, not Y" aphorism ("it's a memory problem, not a compute one"). Reads as generated. State the fact plainly instead.
- Don't put `font-mono` on plain metadata (dates, labels) that isn't code, a timestamp log, or terminal output — it's a borrowed technical costume, not a real constraint.
- No "The test:" callout lines, no big display numerals as an index device — both were tried on the /thinking index and explicitly rejected by the user ("i hate these bits", "i dislike the big numbers").
- SVG `preserveAspectRatio="none"` on a multi-segment bezier curve stretched into an arbitrary tall box distorts it into a kinked, broken-looking line. Use a fixed-aspect motif (see `MarginNote.tsx`) or a plain CSS border instead.
- For node/edge diagrams, use the shared organic bezier curve (`src/components/thinking/kit/edgePath.ts`, consumed by `FlowDiagram.tsx`) rather than straight `<line>` elements — straight grey lines read as a static wiring diagram, not something flowing.
- Compliance, non-negotiable: never mention Claude, Anthropic, GPT, ChatGPT, OpenAI, or any other LLM brand anywhere on this site (or garden.n3wth.com, or hop) — the user works at Google and is not permitted to. Grep for `claude|anthropic|gpt|chatgpt|openai|sonnet|opus|grok|llama|copilot|qwen|mistral|deepmind` before committing any new copy.
