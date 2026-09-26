import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement, lazy, Suspense } from 'react'
import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'
import { parseThinkingMeta } from './lib/thinking-meta.mjs'
import { renderBody, renderThinkingBodies } from './lib/render-thinking.mjs'

test('all registered articles render their authored bodies without browser globals', async () => {
  const bodies = await renderThinkingBodies()
  const registry = readFileSync(new URL('../src/components/thinking/registry.tsx', import.meta.url), 'utf8')
  assert.deepEqual([...bodies.keys()].sort(), parseThinkingMeta(registry).map(meta => meta.id).sort())
  for (const [id, html] of bodies) {
    const dom = new JSDOM(html)
    try {
      const document = dom.window.document
      assert.ok(document.querySelector('p')?.textContent.trim(), `${id}: missing prose`)
      assert.equal(document.querySelector('template[data-msg]'), null, `${id}: failed Suspense subtree`)
    } finally { dom.window.close() }
  }
  const dom = new JSDOM(bodies.get('field-guide'))
  try {
    const guide = dom.window.document
    assert.match(guide.body.textContent, /A guide in three chapters: find the story/)
    assert.ok([...guide.querySelectorAll('h2')].some(h => h.textContent === 'Figure out the story'))
    assert.ok(guide.querySelector('a[href="/thinking/night-field"]'))
  } finally { dom.window.close() }
})

test('lazy content completes before returning static HTML', async () => {
  const Body = lazy(async () => ({ default: () => createElement('p', null, 'Resolved article') }))
  const html = await renderBody(() => createElement(Suspense, { fallback: 'Loading' }, createElement(Body)), '/test')
  assert.match(html, /Resolved article/)
  assert.doesNotMatch(html, /Loading/)
})

test('a failed lazy subtree fails prerender instead of emitting its fallback', async () => {
  const Body = lazy(async () => { throw new Error('Article import failed') })
  await assert.rejects(
    renderBody(() => createElement(Suspense, { fallback: 'Loading' }, createElement(Body)), '/broken'),
    /Cannot prerender \/broken/,
  )
})
