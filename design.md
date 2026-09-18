# Site design

One visual system, with small differences for each site's content. This applies to portfolio, UI docs, Kit, Skills, Garden, r3 and future apps.

## Ownership

- Astryx provides primitive controls and interaction behavior. Link to its [external source](https://github.com/facebook/astryx).
- `packages/ui` owns the Newth theme, fonts, site compositions, component adapters and decorative primitives.
- `packages/site-config` owns shared site identity, metadata and analytics helpers.
- Apps own content, routes, data, router links and specialized product interactions.

Change the lowest appropriate shared layer. Do not copy shared components, CSS or theme tokens into an app to repair a shared problem. Adopt a pattern only where it fits; article outlines, product install commands and immersive artwork have different jobs.

## Page structure

- Use `SiteNavigation`, `PageHeader`, `SiteContainer`, `SiteSection` and `SiteFooter`.
- One persistent top navbar. Do not stack a second sticky mobile heading or section selector beneath it.
- For a few section or documentation destinations, use `SiteSectionLinks`: plain wrapping links in page flow, without a selected-section marker. Persistent desktop sidebars may track the current section.
- For a grouped documentation hierarchy on compact screens, use one disclosure in page flow. Include every page, mark the current page and close it after navigation; do not duplicate it with a row of section links.
- Use a clear title and short description in a hero. Omit actions that repeat navigation or merely jump to the content immediately below. Keep useful product actions such as installation or a resume download.
- Documentation articles use `PageHeader spacing="compact"` with parent-owned margins. Keep the title, description and useful start links together; avoid hero-sized gaps and cards for simple navigation.
- Keep footer content minimal: identity, Contact, GitHub and necessary legal links. All footer text uses the same muted color. Keep identity and links on one row whenever they fit, wrapping only when the content needs it.
- Keep heading order semantic: one primary page heading, section headings below it, then item headings. Visual size does not determine heading level.
- Paragraph copy uses regular weight (400) across all six sites, including article prose and lead paragraphs. Preserve heading, emphasis and control weights.

## Interaction

- Pages appear immediately. No default entry fades, sliding page transitions, staggered text or reveal observers hiding content.
- Establish canvas, theme and navigation colors before first paint. Server output and client theme state must agree; test both saved preferences and system preference where supported.
- Clicking to a different page starts at the top. Explicit anchor links go to their targets. Preserve browser Back scroll restoration.
- Give controls visible keyboard focus and usable touch targets. Expose selected state for real controls, not decorative navigation that scrolls away.
- Use functional motion sparingly and respect reduced motion. Demonstrations must use the actual documented API.

## Review

UI documentation groups live semantic swatches by purpose (surfaces, text and borders, status). Typography specimens render shared type roles; compact comparison layouts preserve interactive examples and code. These are documentation layouts, not new application control styles.

Check the rendered result at narrow mobile, intermediate and desktop widths, in every supported theme. Look for overwritten spacing, doubled headers, code overflow, misleading active states and footer inconsistencies. Test a cold load and navigation from a scrolled page. Shared changes require checking relevant consumers, not only the UI showcase.

See [style.md](style.md) for implementation rules and [the architecture guide](docs/workspace/design-system.md) for package entry points and setup.
