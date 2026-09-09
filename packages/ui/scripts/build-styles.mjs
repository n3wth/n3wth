import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { generateThemeCSS } from '@astryxdesign/core/theme'

const require = createRequire(import.meta.url)
export async function buildStyles() {
  const site = readFileSync('src/site/site.css', 'utf8')
  const canonicalFamilies = /font-family:\s*'(?:Satoshi|Geist Sans|Geist Mono)'\s*;/
  const canonicalFonts = [...site.matchAll(/@font-face\s*\{[^}]*\}/g)]
    .map(([face]) => face)
    .filter(face => canonicalFamilies.test(face))
    .join('\n')
  const css = readFileSync('src/styles.css', 'utf8')
    .replace(/@import 'tailwindcss';\n/, '')
    .replace(/@import '@astryxdesign\/core\/astryx.css';\n\n/, '')
    // Preserve unrelated legacy faces, but share the exact family/weight/URL
    // definitions with site.css so importing both cannot request stale assets.
    .replace(/@font-face\s*\{[^}]*\}/g, face => canonicalFamilies.test(face) ? '' : face)
  const astryx = readFileSync(require.resolve('@astryxdesign/core/astryx.css'), 'utf8')
  copyFileSync('src/theme.css', 'dist/theme.css')
  copyFileSync(require.resolve('@astryxdesign/core/tailwind-theme.css'), 'dist/tailwind-theme.css')
  // Vite builds the canonical TS theme first. Generate CSS from that exact
  // object on every build, so applications never need copied theme files.
  const { n3wthTheme } = await import(pathToFileURL(resolve('dist/theme/n3wthTheme.js')).href)
  const theme = generateThemeCSS(n3wthTheme)
  const foundation = `${astryx}\n@layer reset {\n${theme.prose}\n}\n@layer astryx-theme {\n${theme.component}\n}\n${site}`
  writeFileSync('dist/site.css', foundation)
  writeFileSync('dist/styles.css', `${canonicalFonts}\n${css}\n${foundation}`)
}
