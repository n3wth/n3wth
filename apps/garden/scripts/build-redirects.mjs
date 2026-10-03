import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const redirects = JSON.parse(readFileSync(new URL('../redirects.json', import.meta.url), 'utf8'))
assert.ok(Object.keys(redirects).length > 3, 'Generate redirects with the portfolio notes build first')
for (const [source, target] of Object.entries(redirects)) {
  assert.ok(source.startsWith('/') && !source.startsWith('//'), `Invalid source: ${source}`)
  assert.ok(typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && !target.includes('\\'), `Invalid target: ${target}`)
}
console.log(`Validated ${Object.keys(redirects).length} Garden redirects`)
