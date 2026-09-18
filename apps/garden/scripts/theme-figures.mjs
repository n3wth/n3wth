import { readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { n3wthTheme } from '@n3wth/ui/site'

// SVG images are separate documents: page custom properties cannot reach them.
// Embedded prefers-color-scheme queries follow the embedding element's color-scheme.
// Generate their palettes from the same tokens as the page on every Garden build.
const colors = {
  '#f5f5f7': '--color-background-body',
  '#ffffff': '--color-background-surface',
  '#fff': '--color-background-surface',
  '#e8e8ed': '--color-background-muted',
  '#1d1d1f': '--color-text-primary',
  '#6e6e73': '--color-text-secondary',
  '#c7c7cc': '--color-border-emphasized',
  '#0a5c22': '--color-text-green',
  '#054a6b': '--color-text-cyan',
  '#0071a4': '--color-text-cyan',
  '#6b5803': '--color-text-yellow',
  '#8a1006': '--color-text-red',
  '#248a3d': '--color-text-green',
  '#b8860b': '--color-text-yellow',
}
const themeStyle = /\n?<style data-site-theme="n3wth">[\s\S]*?<\/style>\n?/g

function themePair(token) {
  const value = n3wthTheme.tokens[token]
  if (!value?.startsWith('light-dark(')) throw new Error(`Missing theme pair: ${token}`)
  const pair = value.slice('light-dark('.length, -1)
  let depth = 0
  for (let index = 0; index < pair.length; index += 1) {
    if (pair[index] === '(') depth += 1
    if (pair[index] === ')') depth -= 1
    if (pair[index] === ',' && depth === 0) {
      return [pair.slice(0, index).trim(), pair.slice(index + 1).trim()]
    }
  }
  throw new Error(`Invalid theme pair: ${token}`)
}

export function themeFigure(source) {
  const svg = source.replace(themeStyle, '\n')
  const attributes = [...svg.matchAll(/\b(fill|stroke)="(#[\da-f]+)"/gi)]
  const rules = [...new Set(attributes.map(([, property, color]) => `${property}:${color}`))]
    .map(key => {
      const [property, color] = key.split(':')
      const token = colors[color.toLowerCase()]
      if (!token) throw new Error(`Unmapped figure color: ${color}`)
      return { property, color, values: themePair(token) }
    })
  if (!rules.length) throw new Error('Figure has no themeable colors')
  const palette = mode => rules.map(({ property, color, values }) =>
    `  [${property}="${color}"] { ${property}: ${values[mode]}; }`).join('\n')
  const style = `<style data-site-theme="n3wth">\n${palette(0)}\n@media (prefers-color-scheme: dark) {\n${palette(1)}\n}\n</style>`
  return svg.replace(/(<svg\b[^>]*>)\s*/, `$1\n${style}\n`)
}

async function main() {
  const directory = new URL('../public/figures/', import.meta.url)
  const files = (await readdir(directory, { recursive: true })).filter(name => name.endsWith('.svg'))
  const checkOnly = process.argv.includes('--check')
  let changed = 0
  for (const name of files) {
    const file = new URL(name, directory)
    const source = await readFile(file, 'utf8')
    const themed = themeFigure(source)
    if (source === themed) continue
    if (checkOnly) throw new Error(`Stale figure palette: ${name}; run npm run figures:theme`)
    await writeFile(file, themed)
    changed += 1
  }
  console.log(`${files.length} vector figures checked; ${changed} palettes updated from @n3wth/ui`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
