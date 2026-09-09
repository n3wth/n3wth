# Site maintenance

The UI website lives in apps/ui-docs. The shared package lives in packages/ui; Astryx is its primitive dependency. Keep site content and routing in the app, shared presentation and adapters in UI, and primitive behavior in Astryx.

## Validate from the repository root

Use Node 24 and npm 11.19.1 with the root lockfile.

```sh
npm ci
npm run build --workspace @n3wth/ui
npm run check --workspace @n3wth/ui-docs
npm run check:design
```

The app check builds the Vite site and runs its unit tests. Browser checks cover the architecture guide, primitive interaction, compatibility catalog and docs navigation. Shared UI edits need checks in consuming applications.

## Website and package releases

Vercel builds the workspace package before the docs app and serves apps/ui-docs/dist. Routes include /, /components and /docs/:slug. Update rewrites and the sitemap when adding a route.

Workspace exports are not a promise that the same version is already published on npm. Publishing the UI package is a separate release action.

## Presentation

Use @n3wth/ui/site for the shell and page structure, @n3wth/ui/primitives for native controls, and shared CSS facades for theme integration. Keep the site free of duplicate brand tokens, app-local JSX runtime shims and decorative page-entry motion.

The component catalog shows existing compatibility APIs. Keep its examples accurate when an adapter changes. New architectural guidance belongs in the homepage and active docs, not only in historical design plans.
