import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const versionFile = await readFile(new URL('lib/version.ts', root), 'utf8');
const version = versionFile.match(/\b\d+\.\d+\.\d+\b/)?.[0];
if (!version) throw new Error('Cannot determine published r3 version');
const sourceUrl = `https://raw.githubusercontent.com/n3wth/r3/v${version}/src/index.ts`;
const source = process.argv[2] ? await readFile(process.argv[2], 'utf8') : await (async () => {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Source fetch failed: ${response.status}`);
  return response.text();
})();
const tree = ts.createSourceFile('index.ts', source, ts.ScriptTarget.Latest, true);
let definition;
let defaultUser;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(tree) === 'tools' && node.initializer && ts.isArrayLiteralExpression(node.initializer)) definition = node.initializer;
  if (ts.isVariableDeclaration(node) && node.name.getText(tree) === 'MEM0_USER_ID' && node.initializer && ts.isBinaryExpression(node.initializer)) defaultUser = node.initializer.right;
  ts.forEachChild(node, visit);
}
visit(tree);

// Whitelisted literals only: never evaluate or import the server entrypoint.
function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map((property) => {
    if (!ts.isPropertyAssignment(property)) throw new Error('Non-literal schema property');
    return [property.name.getText(tree).replace(/^['"]|['"]$/g, ''), literal(property.initializer)];
  }));
  if (ts.isTemplateExpression(node)) return node.head.text + node.templateSpans.map((span) => {
    if (span.expression.getText(tree) !== 'MEM0_USER_ID' || !defaultUser) throw new Error('Unknown schema template');
    return literal(defaultUser) + span.literal.text;
  }).join('');
  throw new Error(`Unsupported schema expression: ${node.getText(tree)}`);
}
if (!definition) throw new Error('tools/list definition missing');
const tools = literal(definition);
const schema = {
  version, transport: 'stdio', source: `https://github.com/n3wth/r3/blob/v${version}/src/index.ts`,
  note: 'Snapshot of tools/list using the release default MEM0_USER_ID. A running server can override the user namespace through its environment.',
  tools,
};
await writeFile(new URL('public/mcp-tools.json', root), JSON.stringify(schema, null, 2) + '\n');
const escape = (text) => String(text).replaceAll('|', '\\|').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('{', '&#123;').replaceAll('}', '&#125;').replaceAll('\n', ' ');
const lines = [
  '---', 'order: 4', 'title: API Reference', 'description: Published r3 MCP tools and their input schemas.', '---', '', '# API Reference', '',
  `r3 v${version} exposes ${tools.length} tools through the Model Context Protocol (MCP) over stdio.`, '',
  '[MCP tool schemas (JSON)](/mcp-tools.json) · [Published source](' + schema.source + ')', '',
  '## Schema and transport', '',
  'The machine-readable schema contains every tool name, description, annotation, and input schema from the published release. Connect an MCP client and call `tools/list` to read the definitions from your running server.', '',
  'This release does not expose an HTTP REST API, so it has no OpenAPI document. The JSON schemas above describe MCP tool arguments. They are not an OpenAI API endpoint.', '',
  'Use `tools/call` with a tool name and arguments. Your MCP client handles the JSON-RPC transport:', '',
  '```json', JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'search_memory', arguments: { query: 'programming preferences', limit: 5 } } }, null, 2), '```', '',
  '`user_id` selects a memory namespace. Its default comes from the server’s `MEM0_USER_ID` environment variable. The downloadable schema records the release default.', '',
  '## Tools overview', '', '| Tool | Purpose |', '| --- | --- |',
  ...tools.map((tool) => `| [\`${tool.name}\`](#${tool.name}) | ${escape(tool.description.split('. ')[0])}. |`), '',
];
for (const tool of tools) {
  lines.push(`## ${tool.name}`, '', escape(tool.description), '');
  const properties = Object.entries(tool.inputSchema.properties || {});
  if (!properties.length) lines.push('No arguments required.', '');
  else {
    lines.push('| Argument | Type | Required | Description |', '| --- | --- | --- | --- |');
    for (const [name, property] of properties) lines.push(`| \`${name}\` | ${escape(property.type)} | ${tool.inputSchema.required?.includes(name) ? 'Yes' : 'No'} | ${escape(property.description || '')}${property.enum ? ` Values: ${property.enum.map((value) => `\`${escape(value)}\``).join(', ')}.` : ''} |`);
    lines.push('');
  }
}
await writeFile(new URL('content/docs/api-reference.mdx', root), lines.join('\n'));
console.log(`Updated ${tools.length} tool schemas and API reference from r3 v${version} (${fileURLToPath(root)})`);
