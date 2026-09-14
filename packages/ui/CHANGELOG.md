# @n3wth/ui

## 2.0.0

The monorepo becomes the release source for the shared Newth design system.

- Add the shared site provider, navigation, page headers, layout, typography,
  reading outline and footer through `@n3wth/ui/site`.
- Expose native controls through `@n3wth/ui/primitives` and decorative artwork
  through `@n3wth/ui/visuals`.
- Ship the canonical theme, fonts and complete site foundation in `site.css`,
  plus the Tailwind v4 token bridge.
- Include a v0 Design Systems 2.0 skill and standalone starter.
- Preserve legacy entry points while aligning their compositions with the
  shared flat design system. Existing applications should review appearance,
  typography and navigation when migrating from 0.9.1.

### Migration from 0.9.1

Use Node 24. Install `@n3wth/ui@2.0.0`, import one complete foundation CSS file,
and wrap the app in `N3wthProvider`. Prefer site compositions and native
primitives in new code. Native Button uses `label`; its API differs from the
compatibility Button exported at the package root. Remove direct application
Astryx dependencies, duplicate theme definitions and app-level JSX shims.
Keep router adapters and metadata in the app. Preserve client boundaries in
Next.js. Check both themes, responsive navigation, fonts and CSS asset loading.
