# Fonts

## Licensing

`SuisseIntl-*.woff2` are commercial retail fonts from [Swiss Typefaces](https://www.swisstypefaces.com/licensing-hub).
They carry `fsType=4` (Preview & Print embedding) and require a webfont licence for
the n3wth domains that serve them.

They are deliberately excluded from the published `@n3wth/ui` package. The `files`
array in `package.json` lists font globs individually rather than the whole
directory, so these binaries are never redistributed on npm. **Do not replace those
globs with `public/fonts`** — that would publish licensed binaries to a public
registry.

The release package check uses `scripts/pack-ui.mjs` to stage npm's allowlisted
files. It removes the excluded Suisse `@font-face` rules from the staged CSS and
resolves shipped fonts through package-relative URLs. It does not change the
workspace CSS or its licensed font assets.

External consumers use the `system-ui, -apple-system, sans-serif` fallback in
the theme. Their bundlers do not need to resolve excluded commercial assets.

The remaining fonts are freely licensed and do ship in the package:
Geist and Geist Mono (OFL), Mona Sans (OFL, see `MonaSans-OFL.txt`), Satoshi (Fontshare).
