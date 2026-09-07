# Site identity

The six sites share a near-black background (`#08090b`), white artwork, a 64-unit icon grid, 16-unit corner radius and 3.5-unit rounded strokes. Each mark remains distinct at favicon size.

| Site | Mark |
| --- | --- |
| n3wth | N monogram |
| Garden | Sprout |
| Kit | Cube |
| r3 | Concentric rings |
| Skills | Spark |
| UI | Four-tile grid |

`packages/site-config/icons.js` owns the geometry. Run `npm run icons` at the workspace root to regenerate SVG logos, favicons, PNG sizes, touch icons and ICO fallbacks. Commit the generated assets with the source change.

`packages/site-config/social.js` owns the shared 1200 × 630 social layout. App routes supply their own titles and descriptions. Run `npm run social` for the static portfolio and UI cards. Portfolio article photography remains specific to each article and uses the shared mark.

Keep social titles readable at small preview sizes. Check the default card and a long title when changing the shared layout. Favicons and social images must use the same mark; do not edit exported artwork by hand.

Vercel project avatars use the corresponding generated icon. If an explicit avatar is configured, update it alongside the site assets.
