---
name: n3wth-ui
description: Build React sites with @n3wth/ui 2.x components, Newth tokens, typography and layout conventions. Use when a user requests the n3wth design system.
metadata:
  v0.kind: design-system
---

# n3wth UI

Start from `assets/starter`. Install with Node 24 and npm 11.19.1, then run
`npm install` and `npm run build`. The starter uses the public `@n3wth/ui`
package, not monorepo aliases. Keep its UI dependency synchronized when updating
this skill. The package's emitted type declarations define supported props.

Use `@n3wth/ui/site` for N3wthProvider, SiteNavigation, PageHeader,
SiteContainer, SiteSection, SiteHeading, SiteText and SiteFooter. Use
`@n3wth/ui/primitives` for native controls; Button uses `label` and `onClick`.
Applications must not depend on Astryx directly or copy the UI runtime shim.

Import exactly one complete stylesheet: `@n3wth/ui/site.css`, or
`@n3wth/ui/styles` for compatibility components. CSS includes fonts and tokens.
Tailwind v4 apps may add `@n3wth/ui/tailwind-theme.css` and scan package output.
Do not replace the stylesheet with shadcn defaults.

Use Satoshi headings, Geist body/actions and Geist Mono code. Use semantic
type roles and shared container gutters. Keep surfaces flat, with subtle
borders: no new glows, gradients, shadows or sparkle icons. Show page content
immediately; reserve motion for useful feedback and respect reduced motion.

Bind N3wthProvider to one theme state. Establish the initial theme before
first paint. Keep router-specific links and metadata in the consuming app;
Next.js consumers must retain the package's client boundaries. Preserve
keyboard focus, heading order, mobile navigation and anchor behavior.

Source: `packages/ui` in the reference repository; real consumers:
`docs/` and `packages/ui`. Read `design.md`, `style.md` and
`docs/workspace/design-system.md` for detailed conventions. Verify exports
against the installed version before adopting newer main-branch APIs.

After changes, build and check mobile/desktop in both themes. Verify fonts,
CSS asset requests, native control interactions and console errors. Do not
claim this skill is saved to v0 merely because these source files exist.
