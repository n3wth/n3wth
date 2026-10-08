import assert from 'node:assert/strict'
import test from 'node:test'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPublishedNotes } from './notes/lib/content.ts'
import { markdownToHtml, extractHeadings } from './notes/lib/markdown.ts'
import { getBacklinksForSlug } from './notes/lib/backlinks.ts'

test('clean generation recreates identical local indexes without committed outputs', t => {
  const source = fileURLToPath(new URL('../', import.meta.url))
  const root = mkdtempSync(join(tmpdir(), 'portfolio-notes-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const app = join(root, 'portfolio')
  mkdirSync(join(app, 'src/components/thinking'), { recursive: true })
  mkdirSync(join(app, 'public'), { recursive: true })
  cpSync(join(source, 'scripts'), join(app, 'scripts'), { recursive: true })
  cpSync(join(source, 'package.json'), join(app, 'package.json'))
  cpSync(join(source, 'src/components/thinking/registry.tsx'), join(app, 'src/components/thinking/registry.tsx'))
  symlinkSync(join(source, 'content'), join(app, 'content'))
  symlinkSync(join(source, 'public/figures'), join(app, 'public/figures'))
  symlinkSync(fileURLToPath(new URL('../../../node_modules', import.meta.url)), join(app, 'node_modules'))
  const files = ['garden-index.json', 'garden-search.json', 'writing-index.json']
  const generate = () => execFileSync(process.execPath, ['scripts/build-notes.mjs'], { cwd: app })
  generate()
  const first = files.map(file => readFileSync(join(app, 'src/data', file), 'utf8'))
  assert.ok(JSON.parse(first[2]).length > 0)
  assert.equal(existsSync(join(app, 'src/data/garden-notes.json')), false)
  rmSync(join(app, 'src/data'), { recursive: true })
  generate()
  assert.deepEqual(files.map(file => readFileSync(join(app, 'src/data', file), 'utf8')), first)
})

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
