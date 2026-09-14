import { test } from 'node:test'
import assert from 'node:assert/strict'
import { noteMetadata } from '../src/lib/note-metadata.ts'

test('title fallback survives only when there is no content to excerpt', () => {
  assert.deepEqual(noteMetadata({ title: 'Eight', description: '' }, 'references/books/eight', 'https://garden.n3wth.com'), {
    description: 'Eight - n3wth/garden',
    image: 'https://garden.n3wth.com/og/references/books/eight',
    publishedTime: undefined,
    modifiedTime: undefined,
  })
})

test('derives an excerpt from the first real paragraph when no description is set', () => {
  const content = [
    '# A heading is not a paragraph',
    '',
    '> [!note] A callout is not either',
    '',
    'The first paragraph talks about [[Some Other Note|another note]] and `inline code` with a [link](https://example.com).',
    '',
    'A later paragraph never wins.',
  ].join('\n')
  const { description } = noteMetadata({ title: 'T', content }, 't', 'https://garden.n3wth.com')
  assert.equal(
    description,
    'The first paragraph talks about another note and inline code with a link.'
  )
})

test('excerpt truncates long paragraphs at a word boundary', () => {
  const content = `${'word '.repeat(60)}end`
  const { description } = noteMetadata({ title: 'T', content }, 't', 'https://garden.n3wth.com')
  assert.ok(description.length <= 161)
  assert.ok(description.endsWith('…'))
  assert.equal(description.includes('end'), false)
})

test('uses a real supplied date and never invents a publication date', () => {
  const note = { title: 'A note', description: 'A specific description.', date: '2026-07-14' }
  assert.equal(noteMetadata(note, 'a-note', 'https://garden.n3wth.com').publishedTime, '2026-07-14T00:00:00.000Z')
  assert.equal(noteMetadata(note, 'a-note', 'https://garden.n3wth.com').description, note.description)
  assert.equal(noteMetadata({ ...note, date: 'invalid' }, 'a-note', 'https://garden.n3wth.com').publishedTime, undefined)
})

test('threads the modified timestamp through to dateModified metadata', () => {
  const ms = Date.UTC(2026, 0, 5)
  assert.equal(
    noteMetadata({ title: 'T', description: 'd' }, 't', 'https://garden.n3wth.com', ms).modifiedTime,
    '2026-01-05T00:00:00.000Z'
  )
  assert.equal(
    noteMetadata({ title: 'T', description: 'd' }, 't', 'https://garden.n3wth.com').modifiedTime,
    undefined
  )
})
