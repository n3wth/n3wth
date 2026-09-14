import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
for (const [entry, target] of Object.entries(manifest.exports)) {
  if (typeof target !== 'object') continue
  for (const condition of ['types', 'import']) {
    assert.ok(existsSync(new URL(`../${target[condition]}`, import.meta.url)), `${entry} missing ${condition} output`)
  }
}

// Validate shipped artifacts: source directives and correct JSX do not prove
// that Next consumers or the final CSS cascade will behave correctly.
for (const entry of ['site/index', 'primitives/index', 'visuals/index', 'atoms/CodeBlock/CodeBlock']) {
  const source = readFileSync(new URL(`../dist/${entry}.js`, import.meta.url), 'utf8')
  assert.match(source, /^\s*['"]use client['"];?/, `${entry} lost its client boundary`)
}

for (const file of ['site.css', 'styles.css']) {
  const css = readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8')
  const ordering = css.indexOf('@layer reset, astryx-base, astryx-theme;')
  assert.ok(ordering >= 0 && ordering < css.indexOf('@layer astryx-base {'), `${file}: prose reset must not override native component sizes`)
}
console.log('Shared UI artifact boundaries and CSS layer order verified')
