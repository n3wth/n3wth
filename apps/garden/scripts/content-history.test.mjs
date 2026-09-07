import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeHistory } from './content-history.mjs'

test('snapshot imports preserve old dates while later edits and new notes are recorded', () => {
  const baseline = { 'old.md': { c: 1000, m: 2000 } }
  const log = '5\nM\tapps/garden/content/old.md\nA\tapps/garden/content/new.md\n4\nA\tapps/garden/content/old.md\n'
  assert.deepEqual(mergeHistory(log, 'apps/garden/content/', baseline), {
    'old.md': { c: 1000, m: 5000 }, 'new.md': { c: 5000, m: 5000 },
  })
  assert.deepEqual(baseline, { 'old.md': { c: 1000, m: 2000 } })
})

test('standalone paths work and deletions do not erase history', () => {
  assert.deepEqual(mergeHistory('3\nA\tcontent/new.md\nD\tcontent/old.md\nA\tother.md', 'content/', {
    'old.md': { c: 1000, m: 2000 },
  }), { 'old.md': { c: 1000, m: 2000 }, 'new.md': { c: 3000, m: 3000 } })
})
