/* Bundles the markdown content and OG fonts into src/lib/content-manifest.json
   so the workerd preview never reads the filesystem at runtime: server code
   imports the manifest instead of calling readdirSync/readFileSync.
   The manifest is committed (content-history.json precedent) and regenerated
   by prebuild; scripts/content-manifest.test.mjs guards freshness.
   Keep the ignore lists in sync with src/lib/content.ts. */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

// Mirrors src/lib/content.ts
const IGNORE_DIRS = ['Attachments', 'space', 'space 1', 'Tags']
const IGNORE_FILES = ['build_knowledge_graph.py']

function scanFiles(dir, base) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) continue
      results.push(...scanFiles(path.join(dir, entry.name), base))
    } else if (entry.isFile() && entry.name.endsWith('.md') && !IGNORE_FILES.includes(entry.name)) {
      // POSIX separators: manifest keys are consumed unchanged by
      // content.ts filePath and graph.ts's content-history lookup.
      results.push(path.relative(base, path.join(dir, entry.name)).split(path.sep).join('/'))
    }
  }
  return results
}

export function buildManifest(appRoot = root) {
  const contentDir = path.join(appRoot, 'content')
  const files = {}
  for (const relative of scanFiles(contentDir, contentDir).sort()) {
    files[relative] = readFileSync(path.join(contentDir, relative), 'utf-8')
  }

  const fontsDir = path.join(appRoot, 'src/lib/og-fonts')
  const fonts = {
    regular: readFileSync(path.join(fontsDir, 'Geist-Regular.ttf')).toString('base64'),
    semibold: readFileSync(path.join(fontsDir, 'Geist-SemiBold.ttf')).toString('base64'),
  }

  return { files, fonts }
}

export const manifestPath = path.join(root, 'src/lib/content-manifest.json')

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = buildManifest()
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`content-manifest.json: ${Object.keys(manifest.files).length} notes, ${Object.keys(manifest.fonts).length} fonts`)
}
