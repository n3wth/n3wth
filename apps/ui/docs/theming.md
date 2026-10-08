# Theming

Astryx supplies the token and provider foundation. UI owns the Newth theme and the choices every site should share.

## One provider, one theme

```tsx
import { N3wthProvider } from '@n3wth/ui/site'
import '@n3wth/ui/site.css'

<N3wthProvider mode="dark">{children}</N3wthProvider>
```

The provider accepts dark or light mode. If the site offers a theme toggle, keep one mode state and pass it to this provider. Do not create a second app-local theme.

## Five text roles

| Role | Component | Purpose |
| --- | --- | --- |
| Page | PageHeader or SiteHeading variant="page" | One page title |
| Section | SiteHeading variant="section" | Main content sections |
| Item | SiteHeading variant="item" | Items inside a section |
| Body | SiteText | Reading text |
| Supporting | SiteText variant="supporting" | Secondary context |

Satoshi is the heading family, Geist Sans is the body family, and Geist Mono is reserved for code. The shared stylesheet resolves packaged font assets; new sites do not need to copy font files or add competing font-face rules.

## Use semantic tokens

```css
.product-detail {
  color: var(--color-text-primary);
  background: var(--color-background-surface);
  border: 1px solid var(--color-border);
}
```

Use secondary text and other semantic tokens for their intended role. Avoid local gray palettes that diverge between light and dark modes.

## Tailwind integration

A Tailwind consumer can import the UI facade for Astryx’s theme bridge:

```css
@import 'tailwindcss';
@import '@n3wth/ui/tailwind-theme.css';
@import '@n3wth/ui/site.css';
```

Existing compatibility examples may still need the legacy stylesheet and a source scan of the UI package. Keep that setup scoped to consumers that use those APIs.

## Change the owner

Fonts, global colors, type sizes and page spacing belong in packages/ui. Content-specific charts, illustrations and reading treatments can stay in a site. When a local pattern becomes common to multiple sites, promote it into the shared layer and check every consumer.
