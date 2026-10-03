import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { getPublishedNotes } from './notes/lib/content.ts'
import { markdownToHtml, extractHeadings } from './notes/lib/markdown.ts'
import { getBacklinksForSlug } from './notes/lib/backlinks.ts'

test('published notes, local search, trees, redirects and bodies share one route set', () => {
  const read = file => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'))
  const notes = getPublishedNotes()
  const index = read('../src/data/writing-index.json')
  const search = read('../src/data/garden-search.json')
  const world = read('../public/writing/world.json')
  const redirects = read('../../garden/redirects.json')
  assert.equal(index.length, notes.length)
  assert.equal(search.notes.length, notes.length)
  assert.equal(new Set(world.nodes.map(node => node.id)).size, world.nodes.length)
  const ids = new Set(world.nodes.map(node => node.id))
  for (const note of notes) {
    const href = `/thinking/${note.slug}`
    const body = read(`../public/writing/notes/${note.slug}.json`)
    assert.equal(body.href, href)
    assert.equal(redirects[`/${note.slug}`], href)
    assert.ok(search.notes.some(entry => entry.href === href))
    assert.ok(ids.has(href))
    assert.equal(body.backlinks.length, getBacklinksForSlug(note.slug).length)
    for (const [, href] of body.html.matchAll(/href="([^"?#]+)[^"]*"/g)) {
      if (href.startsWith('/thinking/')) assert.ok(ids.has(href), `${note.slug}: missing ${href}`)
      assert.ok(!/^(?!https?:).*\.md$/i.test(href), `${note.slug}: raw Markdown link ${href}`)
    }
  }
  for (const edge of world.edges) assert.ok(ids.has(edge.source) && ids.has(edge.target))
})

test('Markdown keeps code, callouts and heading anchors while resolving local wikilinks', async () => {
  const html = await markdownToHtml('# Title\n\n## Questions & answers\n\n[[Frameworks/5 Whys#Questions|five questions]]\n\n> [!note]\n> Read carefully.\n\n```js\nconst a = 1\n```\n\n```dataview\nlist\n```')
  assert.ok(html.includes('href="/thinking/frameworks/5-whys#questions"'))
  assert.ok(html.includes('callout'))
  assert.ok(html.includes('<pre'))
  assert.ok(!html.includes('dataview'))
  assert.deepEqual(extractHeadings(html), [{ id: 'questions--answers', text: 'Questions & answers', level: 2 }])
  assert.ok((await markdownToHtml('[[Notes]]')).includes('href="/thinking#notes"'))
})
