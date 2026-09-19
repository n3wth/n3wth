import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
import { visit } from 'unist-util-visit'
import * as content from '../src/lib/content.ts'
import * as noteLinks from '../src/lib/note-links.mjs'

const compiled = ts.transpileModule(readFileSync(new URL('../src/plugins/remark-wikilinks.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
})
const renderer = {}
new Function('require', 'exports', compiled.outputText)((specifier) => {
  if (specifier === '@/lib/content') return content
  if (specifier === '../lib/note-links.mjs') return noteLinks
  throw new Error(`Unexpected renderer dependency: ${specifier}`)
}, renderer)

function renderedLinks(markdown) {
  const processor = noteLinks.createNoteProcessor().use(renderer.remarkWikilinks)
  const tree = processor.runSync(processor.parse(markdown))
  const links = []
  visit(tree, 'link', (node) => {
    if (node.data?.hProperties?.className?.includes('internal-link')) links.push(node)
  })
  return links
}

test('article rendering and discovery share prose link eligibility', () => {
  const markdown = [
    '# [[Books]]',
    '',
    'Read [[Atomic Notes|small notes]] and [[Frameworks/5 Whys#Questions|five questions]].',
    '',
    '`[[Books]]` and ![[Books]] do not add links.',
    '',
    '```text',
    '[[Books]]',
    '```',
    '',
    '```dataview',
    'list from [[Books]]',
    '```',
    '',
    '    [[Books]]',
    '',
    '<div>[[Books]]</div>',
    '',
    '[Already linked [[Books]]](https://example.test)',
    '',
    '[[Missing note]]',
  ].join('\n')
  const targets = noteLinks.extractWikilinks(markdown)
  assert.deepEqual(targets, ['Atomic Notes', 'Frameworks/5 Whys', 'Missing note'])
  const links = renderedLinks(markdown)
  assert.deepEqual(links.map(link => link.url), targets.map(content.resolveWikilink).filter(Boolean).map(slug => `/${slug}`))
  assert.deepEqual(links.map(link => link.children[0].value), ['small notes', 'five questions'])
})

test('tables, lists, and callouts keep visible links and share title removal', () => {
  const markdown = [
    '# [[Books]]', '',
    '| Topic |', '| --- |', '| [[Atomic Notes]] |', '',
    '- Read [[Books]]', '',
    '> [!note]', '> Try [[Frameworks/5 Whys]]', '',
    '# [[Atomic Notes]]',
  ].join('\n')
  assert.deepEqual(noteLinks.extractWikilinks(markdown), ['Atomic Notes', 'Books', 'Frameworks/5 Whys'])
  assert.equal(renderedLinks(markdown).length, 4)
  const processor = noteLinks.createNoteProcessor({ stripTitle: false })
  const tree = processor.runSync(processor.parse('# [[Books]]'))
  assert.equal(tree.children[0].type, 'heading')
})

test('decoded text and formatting preserve each mention context', () => {
  const mentions = noteLinks.getWikilinkMentions('Before **bold** &amp; [[Atomic Notes|an idea]] after, then [[Atomic Notes|another idea]].')
  assert.equal(mentions.length, 2)
  assert.equal(mentions[0].context.slice(0, mentions[0].index), 'Before bold & ')
  assert.equal(mentions[0].context.slice(mentions[0].index + mentions[0].length), ' after, then [[Atomic Notes|another idea]].')
  assert.equal(mentions[1].context.slice(mentions[1].index, mentions[1].index + mentions[1].length), '[[Atomic Notes|another idea]]')
  assert.deepEqual(mentions.map(mention => mention.alias), ['an idea', 'another idea'])
})

test('empty targets and embeds produce no connections', () => {
  const markdown = '![[Books]] [[ ]] ![[Atomic Notes|an embed]]'
  assert.deepEqual(noteLinks.extractWikilinks(markdown), [])
  assert.deepEqual(renderedLinks(markdown), [])
  assert.equal(noteLinks.plainWikilinkText('Read ![[Books]] [[Atomic Notes|a note]].'), 'Read  a note.')
})

test('repeated calls do not retain regular expression state or duplicate targets', () => {
  for (const attempt of [1, 2]) {
    assert.deepEqual(noteLinks.extractWikilinks('[[Atomic Notes]] and [[Atomic Notes|a note]]'), ['Atomic Notes'], String(attempt))
  }
})

test('the author dataview query creates no visible book connection', () => {
  const note = content.getNoteBySlug('kazuo-ishiguro')
  assert.ok(note)
  assert.ok(note.content.includes('[[Books]]'))
  assert.equal(content.resolveWikilink('Books'), 'references/books/books')
  assert.deepEqual(noteLinks.extractWikilinks(note.content), [])
  assert.deepEqual(renderedLinks(note.content), [])
})
