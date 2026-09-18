import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { toMarkdown, getDocsIndex, getDocMarkdown } from './docs-content.ts';
import { getDocBySlug } from './mdx.ts';

test('Markdown removes MDX syntax while preserving code and component content', () => {
  const markdown = toMarkdown('import Diagram from "example";\n\n# Example\n\n<div>\n\n- A list\n\n</div>\n\n<ArchitectureDiagram />\n\n```tsx\nimport { Client } from "client";\n<div>{value}</div>\n```');
  assert.ok(!markdown.includes('import Diagram'));
  assert.ok(markdown.includes('import { Client } from "client";'));
  assert.ok(markdown.includes('<div>{value}</div>'));
  assert.ok(markdown.includes('- A list'));
  assert.ok(markdown.includes('Redis (L1 cache)'));
  assert.ok(!markdown.includes('<ArchitectureDiagram'));
});

test('unknown and unsafe slugs cannot read arbitrary files', async () => {
  for (const slug of ['../package', '..%2fpackage', '/installation', 'missing-page', 'api//client']) {
    assert.equal(await getDocBySlug(slug), null);
    assert.equal(await getDocMarkdown(slug), null);
  }
});

test('the corpus contains article content, release history and schema links', async () => {
  const index = await getDocsIndex();
  assert.match(index.revision, /^[a-f0-9]{16}$/);
  assert.ok(index.sections.some((section) => section.content.includes('/mcp-tools.json')));
  assert.ok(index.sections.some((section) => section.title === 'Changelog'));
  assert.ok(index.sections.some((section) => section.content.includes('import { RecallClient')));
  const schema = JSON.parse(readFileSync('public/mcp-tools.json', 'utf8'));
  assert.equal(schema.version, '1.3.2');
  assert.equal(schema.tools.length, 14);
  assert.deepEqual(schema.tools.find((tool: { name: string }) => tool.name === 'search_memory').inputSchema.required, ['query']);
  assert.ok(!schema.tools.some((tool: { name: string }) => tool.name === 'health_check'));
});
