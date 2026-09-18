import test from 'node:test';
import assert from 'node:assert/strict';
import { searchDocs, searchExcerpt } from './docs-search.ts';
import { getDocsIndex } from './docs-content.ts';

test('search finds body content and prioritizes a named tool', async () => {
  const { sections } = await getDocsIndex();
  const exact = searchDocs(sections, 'deduplicate_memories');
  assert.equal(exact[0].heading, 'deduplicate_memories');
  const body = searchDocs(sections, 'Jaccard similarity');
  assert.ok(body.some((section) => section.content.includes('Jaccard')));
  assert.deepEqual(searchDocs(sections, 'xyzzznotaword'), []);
  assert.deepEqual(searchDocs(sections, 'the and'), []);
});

test('excerpts show the match in a long section', () => {
  const excerpt = searchExcerpt('preface '.repeat(100) + 'deduplication is supported', 'deduplication');
  assert.ok(excerpt.includes('deduplication'));
  assert.ok(excerpt.startsWith('…'));
});
