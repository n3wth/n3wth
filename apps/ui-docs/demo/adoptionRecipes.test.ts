import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

const configPath = resolve('tsconfig.json')
const config = ts.readConfigFile(configPath, ts.sys.readFile)
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(configPath))

it.each([
  ['Getting Started', 'docs/getting-started.md'],
  ['Primitives and themes', '../../docs/developers/ui/primitives-and-themes.mdx'],
  ['Package README', '../../packages/ui/README.md'],
])('%s examples compile through public package exports', (_, documentPath) => {
  const markdown = readFileSync(resolve(documentPath), 'utf8')
  const snippets = [...markdown.matchAll(/^```tsx\n([\s\S]*?)^```/gm)]
  expect(snippets.length).toBeGreaterThan(0)

  const sources = new Map(snippets.map((match, index) => [
    resolve(`demo/adoption-example-${index}.tsx`),
    match[1],
  ]))
  const host = ts.createCompilerHost(options)
  const readFile = host.readFile
  const fileExists = host.fileExists
  host.readFile = path => sources.get(path) ?? readFile(path)
  host.fileExists = path => sources.has(path) || fileExists(path)

  const program = ts.createProgram([...sources.keys()], options, host)
  const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  )
  expect(diagnostics).toEqual([])
})
