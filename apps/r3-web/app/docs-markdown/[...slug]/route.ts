import { getAllDocs } from '@/lib/mdx';
import { getDocMarkdown } from '@/lib/docs-content';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllDocs()).map((doc) => ({ slug: doc.slug.split('/') }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const markdown = await getDocMarkdown((await params).slug.join('/'));
  if (!markdown) return new Response('Not found', { status: 404 });
  return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
