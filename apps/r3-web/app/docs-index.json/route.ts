import { getDocsIndex } from '@/lib/docs-content';

export const dynamic = 'force-static';

export async function GET() {
  return Response.json(await getDocsIndex(), { headers: { 'Cache-Control': 'public, max-age=300' } });
}
