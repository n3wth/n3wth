# @n3wth/ui

The shared Newth theme and site components, built on Astryx.

**Sites → @n3wth/ui → Astryx**

Astryx owns generic controls and interaction behavior. UI owns the pinned dependency, React integration, brand theme, fonts and shared page structure. Sites own content, routing, data and specialized interactions.

## Workspace API

| Entry | Use |
| --- | --- |
| `@n3wth/ui/site` | Provider, navigation, page headers, containers, sections and footer |
| `@n3wth/ui/primitives` | Native Astryx component APIs |
| `@n3wth/ui/site.css` | Astryx styles, Newth theme, fonts and site layout |
| `@n3wth/ui/tailwind-theme.css` | Tailwind token bridge |
| `@n3wth/ui` | Existing component API compatibility and brand utilities |
| `@n3wth/ui/og` | Shared social image renderer |

Applications must not import or depend on Astryx directly. `npm run check:design` enforces this boundary. Compatibility adapters retain historical props where practical; new work uses the native primitives or site compositions. Brand art and specialized interactions remain separate from generic controls.

```tsx
import { N3wthProvider, SiteContainer, PageHeader, SiteFooter } from '@n3wth/ui/site'
import { Button } from '@n3wth/ui/primitives'
import '@n3wth/ui/site.css'

export function App() {
  return <N3wthProvider mode="dark">
    <SiteContainer as="main">
      <PageHeader title="An idea" description="What it helps people do."
        actions={<Button onClick={() => {}}>Get started</Button>} />
    </SiteContainer>
    <SiteFooter />
  </N3wthProvider>
}
```

Satoshi headings, Geist Sans body, Geist Mono code. Keep surfaces flat, navigation immediate and footers minimal. Use shared components rather than copied layouts or local theme definitions.

## Development

Run from the monorepo root with Node 24 and npm 11.19.1:

```sh
npm ci
npm run check --workspace @n3wth/ui
npm run dev:ui
npm run check:design
```

See [the design system guide](../../docs/workspace/design-system.md) and [UI website](https://ui.n3wth.com).

These exports describe the current workspace. The original `n3wth/ui` repository remains the public npm publishing authority during the pilot. Do not publish or create release tags from this workspace; check a published version's exports before using the new entries outside it.

MIT © Oliver Newth
