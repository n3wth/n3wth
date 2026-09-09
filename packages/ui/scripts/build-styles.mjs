import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { generateThemeCSS } from '@astryxdesign/core/theme'

const require = createRequire(import.meta.url)
export async function buildStyles() {
  const site = readFileSync('src/site/site.css', 'utf8')
    + readFileSync('src/site/reading-outline.css', 'utf8')
    + ['band', 'field', 'light'].map(name => readFileSync(`src/visuals/${name}.css`, 'utf8')).join('\n')
  const canonicalFamilies = /font-family:\s*'(?:Satoshi|Geist Sans|Geist Mono)'\s*;/
  const css = readFileSync('src/styles.css', 'utf8')
    .replace(/@import 'tailwindcss';\n/, '')
    .replace(/@import '@astryxdesign\/core\/astryx.css';\n\n/, '')
    // Preserve unrelated legacy faces, but share the exact family/weight/URL
    // definitions with site.css so importing both cannot request stale assets.
    .replace(/@font-face\s*\{[^}]*\}/g, face => canonicalFamilies.test(face) ? '' : face)
  const astryx = readFileSync(require.resolve('@astryxdesign/core/astryx.css'), 'utf8')
  copyFileSync('src/theme.css', 'dist/theme.css')
  const tailwindTheme = readFileSync(require.resolve('@astryxdesign/core/tailwind-theme.css'), 'utf8')
  writeFileSync('dist/tailwind-theme.css', `${tailwindTheme}\n${readFileSync('src/tailwind-theme.css', 'utf8')}`)
  // Vite builds the canonical TS theme first. Generate CSS from that exact
  // object on every build, so applications never need copied theme files.
  const { n3wthTheme } = await import(pathToFileURL(resolve('dist/theme/n3wthTheme.js')).href)
  const theme = generateThemeCSS(n3wthTheme)
  const foundation = `${astryx}\n@layer reset {\n${theme.prose}\n}\n@layer astryx-theme {\n${theme.component}\n}\n${site}`
  writeFileSync('dist/site.css', foundation)
  writeFileSync('dist/styles.css', `${css}\n${foundation}`)
}
