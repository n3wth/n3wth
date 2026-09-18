import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { allowedOrigin, boundedText, isIndex } from './search.ts';

test('only docs, project previews and development origins are allowed', () => {
  assert.ok(allowedOrigin('https://r3.n3wth.com'));
  assert.ok(allowedOrigin('https://r3-git-codex-simplify-r3-docs-n3wth.vercel.app'));
  assert.ok(!allowedOrigin('https://r3.n3wth.com.evil.example'));
  assert.ok(!allowedOrigin('https://other.vercel.app'));
});

test('requests are bounded even without a Content-Length header', async () => {
  await assert.rejects(boundedText(new Response('x'.repeat(4097)), 4096));
  assert.equal(await boundedText(new Response('hello'), 4096), 'hello');
});

test('index validation rejects external citations', () => {
  assert.ok(!isIndex({ revision: 'test', sections: [{ id: '1', title: 'x', heading: 'x', content: 'x', href: 'https://evil.example' }] }));
});

test('rate limiting and invalid input never call the model', async () => {
  const request = (body: string) => new Request('https://search.example/ask', { method: 'POST', headers: { Origin: 'https://r3.n3wth.com', 'Content-Type': 'application/json' }, body });
  const denied = { PER_IP: { limit: async () => ({ success: false }) } };
  const limited = await worker.fetch(request('{}'), denied as Env);
  assert.equal(limited.status, 429);
  const allowed = { PER_IP: { limit: async () => ({ success: true }) }, TOTAL: { limit: async () => ({ success: true }) } };
  const invalid = await worker.fetch(request(JSON.stringify({ query: 'x'.repeat(501) })), allowed as Env);
  assert.equal(invalid.status, 400);
});

test('AI uses retrieved excerpts and returns only trusted citation links', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ revision: 'test', sections: [{ id: '1', title: 'API Reference', heading: 'search_memory', href: '/docs/api-reference', content: 'search_memory accepts a query.' }] })));
  let prompt = '';
  const env = {
    PER_IP: { limit: async () => ({ success: true }) }, TOTAL: { limit: async () => ({ success: true }) }, DOCS_INDEX_URL: 'https://r3.n3wth.com/docs-index.json',
    AI: { run: async (_model: string, input: { messages: { content: string }[] }) => { prompt = input.messages[1].content; return { response: 'Use search_memory with a query. [1]' }; } },
  };
  const response = await worker.fetch(new Request('https://search.example/ask', { method: 'POST', headers: { Origin: 'https://r3.n3wth.com', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'search_memory' }) }), env as unknown as Env);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.match(prompt, /search_memory accepts a query/);
  assert.equal(result.sources[0].href, '/docs/api-reference');
  assert.equal(result.answer, 'Use search_memory with a query. [1]');
});
