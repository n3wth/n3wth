import { createHash } from 'node:crypto';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { getAllDocs, getDocBySlug } from './mdx.ts';
import type { SearchSection } from './docs-search.ts';

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
const writer = unified().use(remarkGfm).use(remarkStringify, { bullet: '-', fences: true });

type ContentNode = { type: string; name?: string | null; value?: string; children?: ContentNode[] };
const nodeText = (node: ContentNode): string => node.value || node.children?.map(nodeText).join('') || '';

// Operate on the syntax tree so imports and JSX inside code fences stay intact.
function cleanNodes(nodes: ContentNode[]): ContentNode[] {
  return nodes.flatMap((node) => {
    if (node.type === 'mdxjsEsm' || node.type.endsWith('Expression')) return [];
    if (node.name === 'ArchitectureDiagram') {
      return [{ type: 'paragraph', children: [{ type: 'text', value: 'Antigravity CLI → MCP → r3 server → Redis (L1 cache) → Mem0 Cloud (L2 storage).' }] }];
    }
    if (node.type.startsWith('mdxJsx')) return cleanNodes(node.children || []);
    if (node.children) node.children = cleanNodes(node.children);
    return [node];
  });
}

export function toMarkdown(content: string) {
  const tree = parser.parse(content);
  cleanNodes([tree]);
  return writer.stringify(tree);
}

export async function getDocMarkdown(slug: string) {
  const doc = await getDocBySlug(slug);
  if (!doc) return null;
  return `${toMarkdown(doc.content).trim()}\n\nSource: https://r3.n3wth.com/docs/${slug}\n`;
}

export async function getDocsIndex() {
  const docs = await getAllDocs();
  const sections: SearchSection[] = [];
  for (const doc of docs) {
    const markdown = await getDocMarkdown(doc.slug);
    if (!markdown) continue;
    const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
    let heading = doc.title;
    let content = '';
    const flush = () => {
      if (content.trim()) sections.push({
        id: `${doc.slug}:${sections.length}`, title: doc.title, heading,
        href: `/docs/${doc.slug}`, content: content.trim(),
      });
      content = '';
    };
    for (const node of tree.children) {
      if (node.type === 'heading') {
        flush();
        heading = nodeText(node);
      } else {
        const text = writer.stringify({ type: 'root', children: [node] });
        if (content.length + text.length > 3000) flush();
        // Bound unusually long examples without dropping the rest of the page.
        for (let offset = 0; offset < text.length; offset += 3000) {
          if (offset) flush();
          content += text.slice(offset, offset + 3000) + '\n';
        }
      }
    }
    flush();
  }
  const revision = createHash('sha256').update(JSON.stringify(sections)).digest('hex').slice(0, 16);
  return { revision, sections };
}
