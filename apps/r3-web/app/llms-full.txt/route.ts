import { getAllDocs } from '@/lib/mdx';
import { getDocMarkdown } from '@/lib/docs-content';

export const dynamic = 'force-static';

export async function GET() {
  const docs = await getAllDocs();
  const pages = await Promise.all(docs.map((doc) => getDocMarkdown(doc.slug)));
  return new Response(pages.join('\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
