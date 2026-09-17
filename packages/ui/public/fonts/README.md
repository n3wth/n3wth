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

External consumers of `@n3wth/ui` therefore receive the `@font-face` rules without
the files. The rules fail to load and the `system-ui, -apple-system, sans-serif`
fallback in the theme applies, which is the intended behaviour.

The remaining fonts are freely licensed and do ship in the package:
Geist and Geist Mono (OFL), Mona Sans (OFL, see `MonaSans-OFL.txt`), Satoshi (Fontshare).
