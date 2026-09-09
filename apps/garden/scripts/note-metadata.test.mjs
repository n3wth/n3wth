import { test } from 'node:test'
import assert from 'node:assert/strict'
import { noteMetadata } from '../src/lib/note-metadata.ts'

test('description fallback and nested image URL agree for metadata and schema', () => {
  assert.deepEqual(noteMetadata({ title: 'Eight', description: '' }, 'references/books/eight', 'https://garden.n3wth.com'), {
    description: 'Eight - n3wth/garden',
    image: 'https://garden.n3wth.com/og/references/books/eight',
    publishedTime: undefined,
  })
})

test('uses a real supplied date and never invents a publication date', () => {
  const note = { title: 'A note', description: 'A specific description.', date: '2026-07-14' }
  assert.equal(noteMetadata(note, 'a-note', 'https://garden.n3wth.com').publishedTime, '2026-07-14T00:00:00.000Z')
  assert.equal(noteMetadata(note, 'a-note', 'https://garden.n3wth.com').description, note.description)
  assert.equal(noteMetadata({ ...note, date: 'invalid' }, 'a-note', 'https://garden.n3wth.com').publishedTime, undefined)
})
