import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const { getDocsIndex } = await import('../lib/docs-content.ts');
const index = await getDocsIndex();
await writeFile('worker/bootstrap-index.json', JSON.stringify(index));
console.log(`Search corpus: ${index.sections.length} sections, revision ${index.revision}`);
