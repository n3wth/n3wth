import test from 'node:test';
import assert from 'node:assert/strict';
import { docsConfig } from './docs-config.ts';
import { getSitemapPages } from './sitemap.ts';

test('sitemap contains the public app and every documented route', () => {
  const pages = getSitemapPages('https://r3.example');
  const urls = pages.map((page) => page.url);
  const documentedSlugs = docsConfig.flatMap((section) => section.items.map((item) => item.slug));

  assert.deepEqual(urls, [
    'https://r3.example',
    'https://r3.example/docs',
    ...documentedSlugs.map((slug) => `https://r3.example/docs/${slug}`),
  ]);
  assert.ok(!urls.includes('https://r3.example/logo-preview'));
});
