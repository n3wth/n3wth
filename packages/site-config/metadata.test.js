import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pageMetadata, pageJsonLd } from './metadata.js'

test('social overrides do not replace search descriptions or canonical URLs', () => {
  const metadata = pageMetadata({ title: 'Components', description: 'Search copy', url: 'https://example.com/components', socialTitle: 'Components — Example', socialDescription: 'Social copy' })
  assert.equal(metadata.description, 'Search copy')
  assert.equal(metadata.openGraph.description, 'Social copy')
  assert.equal(metadata.twitter.title, 'Components — Example')
  assert.equal(metadata.alternates.canonical, metadata.openGraph.url)
})

test('schema keeps page type and normalizes the website identity', () => {
  const options = { url: 'https://example.com/blog', title: 'Blog', description: 'Notes', type: 'Blog', siteUrl: 'https://example.com/' }
  const schema = pageJsonLd(options)
  assert.equal(schema['@type'], 'Blog')
  assert.equal(schema.isPartOf['@id'], 'https://example.com/#website')
  assert.equal(schema.primaryImageOfPage, undefined)
  assert.equal(pageJsonLd({ ...options, image: 'https://example.com/image.png' }).primaryImageOfPage.url, 'https://example.com/image.png')
})
