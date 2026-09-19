import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('atomic-notess permanently redirects to atomic-notes', () => {
  const nextConfig = readFileSync(join(root, 'next.config.ts'), 'utf8')
  assert.match(nextConfig, /source:\s*"\/atomic-notess"/)
  assert.match(nextConfig, /destination:\s*"\/atomic-notes"/)
  assert.match(nextConfig, /permanent:\s*true/)
})
