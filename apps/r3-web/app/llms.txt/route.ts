import { getAllDocs } from '@/lib/mdx';
import { getPackageVersion } from '@/lib/version';

export const dynamic = 'force-static';

export async function GET() {
  const docs = await getAllDocs();
  const content = [
    '# r3', '',
    `> r3 v${getPackageVersion()} is a Redis memory MCP server for AI assistants.`, '',
    'Install and run with `npx @n3wth/r3`. Connect through an MCP client using stdio.', '',
    '## Machine-readable documentation', '',
    '- [All documentation as Markdown](https://r3.n3wth.com/llms-full.txt)',
    '- [Published MCP tool schemas](https://r3.n3wth.com/mcp-tools.json)',
    '- [Search index](https://r3.n3wth.com/docs-index.json)', '',
    'The published tool schemas are authoritative for tool names and arguments. Some SDK guides contain older examples; check them against the released package.', '',
    '## Pages', '',
    ...docs.map((doc) => `- [${doc.title}](https://r3.n3wth.com/docs-markdown/${doc.slug})`), '',
    '## Releases', '',
    '- [Changelog](https://r3.n3wth.com/docs/changelog)',
    '- [Upstream source and releases](https://github.com/n3wth/r3)', '',
  ].join('\n');
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
