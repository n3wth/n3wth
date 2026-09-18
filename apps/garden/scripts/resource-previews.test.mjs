import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import { getResourcePreviews, selectResourcePreviews } from '../src/lib/resource-previews.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
process.chdir(root)
const manifests = ['career', 'frameworks', 'knowledge', 'wellbeing'].flatMap((batch) =>
  JSON.parse(readFileSync(path.join(root, '../../docs/editorial/visuals', batch + '.json'), 'utf8'))
)
const selections = JSON.parse(readFileSync(path.join(root, 'src/lib/resource-preview-data.json'), 'utf8'))

// Node's type stripping does not handle TSX. Compile only this dependency-free
// server component for rendering assertions; this does not invoke a site build.
const componentPath = path.join(root, 'src/components/ResourcePreviews.tsx')
const compiled = ts.transpileModule(readFileSync(componentPath, 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
})
const componentExports = {}
new Function('require', 'exports', compiled.outputText)(createRequire(import.meta.url), componentExports)
const { ResourcePreviews } = componentExports

const source = (url, title = 'A useful resource') => ({
  url, title, publisher: 'Research group',
})
const choices = (...indices) => indices.map((index) => ({
  source: index, description: 'Explains the method and when it is useful.',
}))

test('all enhanced articles have curated, current sources and reader-facing copy', () => {
  assert.ok(manifests.length >= 100)
  assert.equal(new Set(manifests.map((record) => record.file)).size, manifests.length)
  assert.deepEqual(Object.keys(selections).sort(), manifests.map((record) => record.file).sort())

  for (const record of manifests) {
    const resources = getResourcePreviews(record.file)
    assert.ok(resources.length >= 1 && resources.length <= 3, record.file)
    assert.equal(resources.length, selections[record.file].length, record.file)
    assert.deepEqual(getResourcePreviews(path.join(root, 'content', record.file)), resources)
    const article = readFileSync(path.join(root, 'content', record.file), 'utf8')
    for (const resource of resources) {
      assert.ok(record.sources.some((item) => item.url === resource.url), record.file)
      assert.ok(article.includes(resource.url.replaceAll('&', '&amp;')) || article.includes(resource.url), record.file)
      assert.ok(resource.description.length >= 45 && resource.description.length <= 180, record.file)
      assert.doesNotMatch(resource.description, /figure|manifest|transport|HTTP|accessed|resized|licen[cs]e/i)
      assert.doesNotMatch([resource.publisher, resource.title, resource.description].join(' '),
        /\b(?:OpenAI|ChatGPT|Claude|Anthropic|Gemini|Copilot|DeepSeek)\b/i)
    }
    const markup = renderToStaticMarkup(createElement(ResourcePreviews, { resources }))
    assert.equal((markup.match(/<li /g) || []).length, resources.length, record.file)
    assert.match(markup, /aria-label="Further reading"/)
  }
})

test('unsafe destinations and incomplete selections never become links', () => {
  const sources = [
    source('javascript:alert(1)'), source('data:text/html,hello'),
    source('http://example.org'), source('//example.org'), source('/internal'),
    source('https://reader:secret@example.org'), source('not a URL'),
    source('https://example.org/empty-title', ' '), source('https://example.org/safe'),
  ]
  assert.deepEqual(selectResourcePreviews(sources, choices(0, 1, 2, 3, 4, 5, 6, 7, 99, 8)),
    [{ ...sources[8], description: choices(8)[0].description }])
  assert.deepEqual(selectResourcePreviews(sources, [{ source: 8, description: ' ' }]), [])
})

test('selection order is curated, duplicate pages are collapsed and output stops at three', () => {
  const sources = [
    source('https://example.org/one#section'),
    source('https://example.org/one'),
    source('https://example.org/two'),
    source('https://example.org/three'),
    source('https://example.org/four'),
  ]
  assert.deepEqual(selectResourcePreviews(sources, choices(2, 0, 1, 3, 4)).map((item) => item.url),
    [sources[2].url, sources[0].url, sources[3].url])
})

test('a replacement source supplies its current URL, title and publisher', () => {
  const original = source('https://example.org/old')
  const replacement = { url: 'https://university.example/new', title: 'Updated guidance', publisher: 'University' }
  const selected = choices(0)
  assert.equal(selectResourcePreviews([original], selected)[0].url, original.url)
  assert.deepEqual(selectResourcePreviews([replacement], selected),
    [{ ...replacement, description: selected[0].description }])
})

test('unlisted notes have no empty section', () => {
  assert.deepEqual(getResourcePreviews('Unlisted note.md'), [])
  assert.equal(renderToStaticMarkup(createElement(ResourcePreviews, { resources: [] })), '')
})

test('source text is escaped as text, with no tooltips, embedded HTML or remote images', () => {
  const resources = selectResourcePreviews([{
    url: 'https://example.org/read?x=1&y=2',
    title: '<img src=x onerror=alert(1)>',
    publisher: '<script>alert(1)</script>',
  }], [{ source: 0, description: '<iframe src="https://example.org"></iframe>' }])
  const markup = renderToStaticMarkup(createElement(ResourcePreviews, { resources }))
  assert.match(markup, /&lt;img/)
  assert.match(markup, /&lt;script/)
  assert.match(markup, /&lt;iframe/)
  assert.match(markup, /href="https:\/\/example.org\/read\?x=1&amp;y=2"/)
  assert.doesNotMatch(markup, /<(?:img|script|iframe)|dangerouslySetInnerHTML|internal-link|role="tooltip"/)
})
