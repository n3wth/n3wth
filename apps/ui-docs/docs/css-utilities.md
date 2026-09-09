# CSS Utilities

The shared page system owns the ordinary layout. Use local CSS for the parts specific to a product.

## Site styles

```tsx
import '@n3wth/ui/site.css'
```

This stylesheet supplies the shared theme, fonts and site component rules. Pair it with N3wthProvider. Use SiteContainer and SiteSection instead of copying their gutters, widths and padding into each app.

The n3wth-site-main class gives content clearance beneath the fixed navigation.

## Tailwind theme facade

```css
@import 'tailwindcss';
@import '@n3wth/ui/tailwind-theme.css';
@import '@n3wth/ui/site.css';
```

The facade keeps apps importing through UI while the underlying theme bridge comes from Astryx. It does not transfer ownership of brand decisions to an individual site.

## Compatibility CSS

Existing root components may use @n3wth/ui/styles and Tailwind classes scanned from the package. Preserve that setup while migrating those components. New page structure should use the site entry point.

Do not use legacy glass, glow or entrance-animation utilities to define a competing site style.

## Accessibility checks

Keep focus indicators visible. Use semantic elements before adding ARIA. Check keyboard navigation, text contrast, reduced motion, narrow screens and zoom. Do not hide content behind animation or make hover the only way to discover an action.
