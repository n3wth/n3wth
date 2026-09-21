# Site design

One visual system, with small differences for each site's content. This applies to portfolio, UI docs, Kit, Skills, Garden, r3 and future apps.

## Ownership

Use the supplied Newth four-part mark across site identity, favicons and social
images. The exact SVG geometry is shared in `packages/site-config/brand-marks.js`.
Use black or white on contrasting surfaces and the contained version for app
icons. Originals are also hosted at `https://r2.n3wth.com/mark-contained.svg`,
`mark-black.svg` and `mark-white.svg`. Generate raster sizes from these originals.

- Astryx provides primitive controls and interaction behavior. Link to its [external source](https://github.com/facebook/astryx).
- `packages/ui` owns the Newth theme, fonts, site compositions, component adapters and decorative primitives.
- `packages/site-config` owns shared site identity, metadata and analytics helpers.
- Apps own content, routes, data, router links and specialized product interactions.

Change the lowest appropriate shared layer. Do not copy shared components, CSS or theme tokens into an app to repair a shared problem. Adopt a pattern only where it fits; article outlines, product install commands and immersive artwork have different jobs.

## Page structure

- Use `SiteNavigation`, `PageHeader`, `SiteContainer`, `SiteSection` and `SiteFooter`.
- One persistent top navbar. Do not stack a second sticky mobile heading or section selector beneath it.
- For a few section or documentation destinations, use `SiteSectionLinks`: plain wrapping links in page flow, without a selected-section marker. Persistent desktop sidebars may track the current section.
- For a grouped documentation hierarchy on compact screens, put the pages in the top navigation menu and show the documentation context in its brand path. Include every page, mark the current page and close after navigation; do not add a second navigation row.
- Use a clear title and short description in a hero. Omit actions that repeat navigation or merely jump to the content immediately below. Keep useful product actions such as installation or a resume download.
- Do not place small category labels or eyebrow text above titles. Let the title stand on its own.
- Experience dates belong beneath the role within the company group, rather than in a separate grid column.
- Documentation articles use `PageHeader spacing="compact"` with parent-owned margins. Keep the title, description and useful start links together; avoid hero-sized gaps and cards for simple navigation.
- Documentation brand paths link each segment to its own home. Keep page-copy and Markdown actions compact below the title. Use one search dialog for content results and explicitly requested, cited AI answers; keep results available when AI fails.
- Keep footer content minimal: identity, Contact, GitHub and necessary legal links. All footer text uses the same muted color.
- The portfolio footer keeps links and a compact email signup on one desktop row, without repeating the identity. The signup has an inset arrow submit button and fills the content width on mobile. Empty signup status messages take no layout space.
- Keep the footer identity and links on one row when their content fits; wrap naturally on narrow screens instead of stacking at a fixed breakpoint.
- Keep heading order semantic: one primary page heading, section headings below it, then item headings. Visual size does not determine heading level.
- Paragraph copy uses regular weight (400) across all six sites, including article prose and lead paragraphs. Preserve heading, emphasis and control weights.
- Primary paragraph copy uses the existing softer gray ink in dark mode. Supporting/status text retains its semantic color; light-theme ink stays unchanged.
- Reading outline labels, section counts and links use the same supporting type size and regular weight; active links may use medium weight.
- Connected-note links use the same supporting size. Avoid decorative side-accent borders on callouts or article graphics.

## Interaction

Article graphics explain the adjacent argument. Keep each figure with a descriptive caption, visible source links and useful alt text. Distinguish original conceptual diagrams from measured charts and reproduced images. Use a single supporting text style for captions, reserve the image dimensions, and let readers open detailed graphics at full size. Record reuse rights for third-party assets; a citation alone is not permission.

Original diagrams stay in SVG format and follow the surrounding page's color scheme. Generate embedded light/dark palettes from the shared theme; an SVG loaded as an image cannot inherit page custom properties. Keep photographs in their original colors.

Use selective Further reading previews after an article: publisher, linked title and a short explanation of its value. Keep them flat and within the reading column, using existing type and spacing. Do not turn every citation into a card or load remote thumbnails without verified reuse rights.

- Pages appear immediately. No default entry fades, sliding page transitions, staggered text or reveal observers hiding content.
- Establish canvas, theme and navigation colors before first paint. Server output and client theme state must agree; test both saved preferences and system preference where supported.
- Clicking to a different page starts at the top. Explicit anchor links go to their targets. Preserve browser Back scroll restoration.
- Give controls visible keyboard focus and usable touch targets. Expose selected state for real controls, not decorative navigation that scrolls away.
- Use functional motion sparingly and respect reduced motion. Demonstrations must use the actual documented API.

## Review

UI documentation groups live semantic swatches by purpose (surfaces, text and borders, status). Typography specimens render shared type roles; compact comparison layouts preserve interactive examples and code. These are documentation layouts, not new application control styles.

Check the rendered result at narrow mobile, intermediate and desktop widths, in every supported theme. Look for overwritten spacing, doubled headers, code overflow, misleading active states and footer inconsistencies. Test a cold load and navigation from a scrolled page. Shared changes require checking relevant consumers, not only the UI showcase.

See [style.md](style.md) for implementation rules and [the architecture guide](docs/workspace/design-system.md) for package entry points and setup.
