import bootstrapIndex from './bootstrap-index.json' with { type: 'json' };
import { searchDocs, type SearchSection } from '../lib/docs-search.ts';
import { instructions } from './instructions.ts';

export function allowedOrigin(origin: string) {
  return origin === 'https://r3.n3wth.com'
    || /^https:\/\/r3-[a-z0-9-]+-n3wth\.vercel\.app$/.test(origin)
    || /^http:\/\/(127\.0\.0\.1|localhost):(4386|4286)$/.test(origin);
}

export async function boundedText(response: Response | Request, maximum: number) {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return text + decoder.decode();
      size += value.byteLength;
      if (size > maximum) throw new Error('Body too large');
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel();
  }
}

export function isIndex(value: unknown): value is { revision: string; sections: SearchSection[] } {
  if (!value || typeof value !== 'object' || !('revision' in value) || typeof value.revision !== 'string' || !('sections' in value) || !Array.isArray(value.sections) || value.sections.length > 1000) return false;
  return value.sections.length > 0 && value.sections.every((section) => section && typeof section === 'object'
    && ['id', 'title', 'heading', 'content', 'href'].every((key) => typeof section[key] === 'string')
    && /^\/docs\/[a-z0-9/-]+$/.test(section.href) && section.content.length <= 10000);
}

async function getIndex(env: Env) {
  try {
    const response = await fetch(env.DOCS_INDEX_URL, { cf: { cacheTtl: 300, cacheEverything: true }, signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error('Index unavailable');
    const index: unknown = JSON.parse(await boundedText(response, 2_000_000));
    if (!isIndex(index)) throw new Error('Invalid index');
    return index;
  } catch {
    // A deployment snapshot keeps search available during frontend outages.
    console.warn(JSON.stringify({ event: 'docs_index_fallback', revision: bootstrapIndex.revision }));
    return bootstrapIndex;
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const headers = {
      'Access-Control-Allow-Origin': origin, 'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    };
    const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
    if (!allowedOrigin(origin)) return new Response('Forbidden', { status: 403 });
    if (new URL(request.url).pathname !== '/ask') return json({ error: 'Not found' }, 404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'Expected JSON' }, 415);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!(await env.PER_IP.limit({ key: ip })).success || !(await env.TOTAL.limit({ key: 'all' })).success) {
      return new Response(JSON.stringify({ error: 'Try again in a minute' }), { status: 429, headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': '60' } });
    }
    let query: string;
    try {
      const body: unknown = JSON.parse(await boundedText(request, 4096));
      if (!body || typeof body !== 'object' || !('query' in body) || typeof body.query !== 'string' || !body.query.trim() || body.query.length > 500) return json({ error: 'Question must be 1–500 characters' }, 400);
      query = body.query.trim();
    } catch {
      return json({ error: 'Invalid request' }, 400);
    }
    try {
      const index = await getIndex(env);
      const sources = searchDocs(index.sections, query, 6);
      if (!sources.length) return json({ answer: 'I couldn’t find this in the r3 documentation. Try a tool name or a more specific question.', sources: [], revision: index.revision });
      const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: instructions },
          { role: 'user', content: JSON.stringify({ question: query, excerpts: sources.map((source, i) => ({ citation: i + 1, title: source.title, section: source.heading, text: source.content.slice(0, 3000) })) }) },
        ],
        max_tokens: 700, temperature: 0.2,
      });
      const answer = result && typeof result === 'object' && 'response' in result && typeof result.response === 'string' ? result.response.trim() : '';
      if (!answer) throw new Error('Empty answer');
      const citations = [...answer.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
      if (!citations.length || citations.some((citation) => citation < 1 || citation > sources.length)) {
        return json({ answer: 'I couldn’t produce a reliably cited answer. These documentation sections may help.', sources: sources.map(({ id, title, heading, href }) => ({ id, title, heading, href })), revision: index.revision });
      }
      return json({ answer, sources: sources.map(({ id, title, heading, href }) => ({ id, title, heading, href })), revision: index.revision });
    } catch (error) {
      console.error(JSON.stringify({ event: 'docs_answer_failed', type: error instanceof Error ? error.name : 'Unknown' }));
      return json({ error: 'AI answers are temporarily unavailable' }, 503);
    }
  },
} satisfies ExportedHandler<Env>;
