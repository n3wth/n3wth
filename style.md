# Style implementation

Use the existing system; do not introduce another visual scale or a new set of colors per app.

## Tokens and type

- Canonical tokens: `packages/ui/src/theme/n3wthTheme.ts`. Generated CSS is build output, never a hand-edited source.
- Satoshi for headings, Geist Sans for body and controls, Geist Mono for code. Use semantic type roles instead of arbitrary sizes.
- Use existing semantic colors for canvas, surfaces, text and borders. Flat surfaces, subtle borders, no added glows, shadows or gradients. No sparkle icons.
- Documentation examples use `CodeBlock size="sm"`. Preserve horizontal scrolling and copy controls. Add line numbers or language labels only when useful.
- Code punctuation is readable content, not disabled text. Measure contrast against the actual code surface in both themes.

## CSS and layout

- Import one complete foundation: `@n3wth/ui/site.css`, or `@n3wth/ui/styles` when compatibility styles are needed. Do not import both.
- Tailwind v4 consumers import `@n3wth/ui/tailwind-theme.css` and scan shared output where required.
- Keep the reset layer below Astryx component styles. Check computed styles: utility classes can be overridden by component resets or layer order even when present in markup.
- Parents own spacing between components. Put documentation margins or gaps on layout wrappers when the child owns its own margin reset. Do not escalate to `!important` or per-app shared-selector overrides.
- Use shared container gutters and section spacing. A bulletless list has no leftover bullet indentation.
- Shared footer containers inherit footer color. Do not reset nested text to primary ink.
- Put responsive visibility on a wrapper when a shared component owns its display layout.

## React and packaging

- Sites depend on UI; UI depends on Astryx. Apps never import Astryx directly.
- Forward native icon, size and interaction props through adapters instead of recreating their layout inside labels.
- Preserve client boundaries in emitted package chunks used by Next server components. A source directive stripped by the bundler is insufficient.
- Keep router and framework bindings in apps; share framework-neutral behavior where it avoids real duplication.
- Follow each repo file's code conventions. Use the root lockfile and pinned workspace UI version; no extra package copies or framework upgrades for cosmetic fixes.

## Validation

Read before editing. Use a feature branch. Build shared packages before app checks. Run `npm run check` for the complete workspace; use focused workspace checks during iteration. `check:design` enforces ownership and `check:metadata` checks generated public page metadata.

For CSS, routing or packaging changes, also run relevant browser tests and inspect screenshots. Validate dimensions, scroll position, theme at first paint and interactions rather than relying only on class-name tests. Before reporting a deployment complete, verify the live affected pages.
