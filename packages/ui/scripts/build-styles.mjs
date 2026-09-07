import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
export function buildStyles() {
  const css = readFileSync('src/styles.css', 'utf8')
    .replace(/@import 'tailwindcss';\n/, '')
    .replace(/@import '@astryxdesign\/core\/astryx.css';\n\n/, '')
  const astryx = readFileSync(require.resolve('@astryxdesign/core/astryx.css'), 'utf8')
  writeFileSync('dist/styles.css', `${css}\n/* Astryx component styles (@astryxdesign/core) */\n${astryx}`)
  copyFileSync('src/theme.css', 'dist/theme.css')
}
