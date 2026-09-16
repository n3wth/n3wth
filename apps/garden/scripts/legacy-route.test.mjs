import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { recoverableGardenSlugs, resolveLegacySlug } from '../src/lib/legacy-route.ts'

process.chdir(fileURLToPath(new URL('..', import.meta.url)))
const { getNoteBySlug, isPublishedNote } = await import('../src/lib/content.ts')

test('legacy Garden paths resolve only to published canonical slugs', () => {
  assert.equal(
    resolveLegacySlug('Actual+Gardening+Costs'),
    'actual-gardening-costs'
  )
  assert.equal(resolveLegacySlug('Career-Planning'), 'career-planning')
  assert.equal(resolveLegacySlug('Frameworks/5-Whys'), 'frameworks/5-whys')
})

test('canonical and unknown paths do not redirect', () => {
  assert.equal(resolveLegacySlug('career-planning'), undefined)
  assert.equal(resolveLegacySlug('Definitely+Not+A+Published+Note'), undefined)
})

test('every recoverable destination is still a published note', () => {
  for (const slug of recoverableGardenSlugs) {
    const note = getNoteBySlug(slug)
    assert.ok(note, slug)
    assert.equal(isPublishedNote(note), true, slug)
  }
})
