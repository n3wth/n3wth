import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
for (const [entry, target] of Object.entries(manifest.exports)) {
  if (typeof target !== 'object') continue
  for (const condition of ['types', 'import']) {
    assert.ok(existsSync(new URL(`../${target[condition]}`, import.meta.url)), `${entry} missing ${condition} output`)
  }
}

for (const file of readdirSync(new URL('../dist/', import.meta.url), { recursive: true })) {
  if (!file.endsWith('.js')) continue
  const source = readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8')
  assert.doesNotMatch(source, /(?:from\s*|import\s*\()['"]react\/jsx-dev-runtime['"]/, `${file} bypasses UI JSX normalization`)
}

execFileSync(process.execPath, ['--conditions=react-server', '--input-type=module', '-e', `
  import assert from 'node:assert/strict'
  import { OGCard } from ${JSON.stringify(new URL('../dist/og/index.js', import.meta.url).href)}
  assert.equal(typeof OGCard({ title: 'Server render' }).type, 'string')
`], { stdio: 'inherit' })

for (const file of ['site.css', 'styles.css']) {
  const css = readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8')
  const ordering = css.indexOf('@layer reset, astryx-base, astryx-theme;')
  assert.ok(ordering >= 0 && ordering < css.indexOf('@layer astryx-base {'), `${file}: prose reset must not override native component sizes`)
}
console.log('Shared UI artifact boundaries and CSS layer order verified')
