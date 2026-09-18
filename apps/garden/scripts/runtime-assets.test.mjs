import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const nextConfig = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8')

test('runtime bundles trace Garden content for every route pattern', () => {
  const contentIncludes = nextConfig.match(/"\.\/content\/\*\*"/g) ?? []

  assert.equal(contentIncludes.length, 2)
})
