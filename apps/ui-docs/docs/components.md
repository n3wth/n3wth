# Components

There are three responsibilities: site composition, Astryx primitives, and compatibility with existing UI APIs.

## Shared site composition

Import from @n3wth/ui/site.

| Component | Responsibility |
| --- | --- |
| N3wthProvider | Apply the shared Newth theme |
| SiteNavigation | Common navigation layout and mobile disclosure |
| PageHeader | Hero title, description, actions and optional aside |
| SiteContainer | Shared width and horizontal gutters |
| SiteSection | Shared vertical section rhythm |
| SiteHeading / SiteText | Semantic text roles |
| SiteFooter | Quiet, aligned site footer |

Navigation links, action callbacks and content remain app-owned. Use real links for navigation and buttons for actions.

```tsx
import { PageHeader, SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'

<PageHeader
  title="Work"
  description="Selected projects."
  actions={<a href="/resume.pdf">Resume (PDF)</a>}
/>

<SiteSection aria-labelledby="projects">
  <SiteHeading id="projects">Projects</SiteHeading>
  <SiteText>What each project helps people do.</SiteText>
</SiteSection>
```

The header’s aside slot is for a specialized preview or demonstration. It does not introduce another typography or spacing system.

## Native primitives

Import from @n3wth/ui/primitives to use Astryx APIs through UI’s dependency boundary. Astryx owns the underlying controls and interaction behavior. UI adds the theme and shared compositions.

Use native primitive props from the installed workspace types. Keep accessible names, labels, focus behavior and state relationships intact; a library does not remove the application’s accessibility responsibilities.

## Existing UI APIs

Root imports from @n3wth/ui remain for compatibility. Adapters translate existing props onto Astryx where appropriate. Root exports can also include project-specific illustrations and utilities.

Do not mix root-component props with the primitives API. Migrate a component and its props together, then verify its behavior.

The current adapters have a few explicit boundaries:

- Switch refs target a native input. Modal refs continue to target the inner content div; Astryx owns the outer dialog.
- Input and Textarea preserve native controls inside Astryx Field so external labels, input types, uncontrolled values and form reset keep working.
- Avatar preserves a native image path for arbitrary fallback text, image attributes and callbacks. Button asChild retains the supplied host element.
- Astryx owns tooltip and dropdown presentation. The old tooltip arrow, dropdown portal and menuClassName settings do not customize that presentation; use the native API for new work.
- Compatibility Toast variants share the Astryx information surface, except errors, which use its error surface. Historical Hero gradient and entry-animation settings are no longer applied.

[Open compatibility examples](/components).

## Where to make a change

| Change | Owner |
| --- | --- |
| Copy, route, business state | Site |
| Brand tokens, shared page structure, API adaptation | UI |
| Primitive behavior and native control API | Astryx |

Do not add a second implementation of a shared control inside a site to work around an adapter issue. Fix the boundary, then test the affected interaction.
