/**
 * Build-time snapshot of the published @n3wth/ui package version, for
 * the /library page's install instructions. Same contract as the other
 * fetch-*.mjs scripts: never fails the build, never invents content —
 * on any error the committed snapshot is left untouched.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/data/ui-meta.json')
const SOURCE = 'https://registry.npmjs.org/@n3wth%2Fui/latest'

try {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`registry ${res.status}`)
  const data = await res.json()
  const version = data.version
  if (typeof version !== 'string' || !version) throw new Error('registry response missing version')

  const snapshot = { version, install: 'npm install @n3wth/ui' }
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`[ui-meta] snapshot updated: ${version}`)
} catch (err) {
  try {
    readFileSync(OUT, 'utf8')
    console.warn(`[ui-meta] fetch failed (${err.message}); keeping committed snapshot`)
  } catch {
    writeFileSync(OUT, JSON.stringify({ version: '', install: 'npm install @n3wth/ui' }, null, 2) + '\n')
    console.warn(`[ui-meta] fetch failed (${err.message}); wrote empty snapshot`)
  }
}
