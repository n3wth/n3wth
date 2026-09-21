/**
 * Refreshes the committed npm registry snapshot in src/data/ui-meta.json.
 * Garden content is generated locally by build-notes.mjs and is never fetched.
 *
 * Run manually, or on a schedule. This repo has no
 * refresh-portfolio-content workflow yet; add one under .github/workflows
 * if a schedule is needed. This script is not part of `prebuild`, `build`,
 * or `check`, and is not wired into scripts/build.mjs or
 * scripts/affected.mjs, so no task cache can skip it — every run always
 * contacts every selected source.
 *
 * Unlike the old fetch-*.mjs scripts, a failed source does NOT keep quiet
 * and does NOT touch its files: it's reported in `failed` and the CLI exits
 * 1, so a partial failure is visible instead of silently shipping whatever
 * was fetched last time.
 *
 * Usage: node scripts/refresh-content.mjs [--only <source-name>]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { SOURCES, canonical } from './lib/content-sources.mjs'

const DEFAULT_DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/data')

/**
 * @param {object} [options]
 * @param {typeof SOURCES} [options.sources]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {string} [options.dataDir]
 * @param {(...args: unknown[]) => void} [options.log]
 * @param {string} [options.only] - refresh a single source by name
 * @returns {Promise<{ updated: string[], unchanged: string[], failed: { name: string, error: string }[] }>}
 */
export async function refreshContent({
  sources = SOURCES,
  fetchImpl = globalThis.fetch,
  dataDir = DEFAULT_DATA_DIR,
  log = console.log,
  only,
} = {}) {
  const selected = only ? sources.filter((s) => s.name === only) : sources
  if (only && selected.length === 0) {
    throw new Error(`content:refresh: unknown source "${only}" (known: ${sources.map((s) => s.name).join(', ')})`)
  }

  const updated = []
  const unchanged = []
  const failed = []

  for (const source of selected) {
    try {
      const texts = []
      for (const url of source.urls) {
        const res = await fetchImpl(url, { signal: AbortSignal.timeout(10_000) })
        if (!res.ok) throw new Error(`${url} responded ${res.status}`)
        texts.push(await res.text())
      }

      const valueByFile = source.parse(texts)
      const errors = source.validate(valueByFile)
      if (errors.length > 0) throw new Error(errors.join('; '))

      let sourceChanged = false
      for (const file of source.files) {
        const path = join(dataDir, file)
        const nextText = canonical(valueByFile[file])
        const currentText = existsSync(path) ? readFileSync(path, 'utf8') : undefined
        if (currentText === nextText) continue
        writeFileSync(path, nextText)
        sourceChanged = true
      }
      if (sourceChanged) updated.push(source.name)
      else unchanged.push(source.name)
    } catch (err) {
      failed.push({ name: source.name, error: err instanceof Error ? err.message : String(err) })
    }
  }

  log(`updated: ${updated.length > 0 ? updated.join(', ') : '(none)'}`)
  log(`unchanged: ${unchanged.length > 0 ? unchanged.join(', ') : '(none)'}`)
  for (const failure of failed) log(`FAILED: ${failure.name} (${failure.error})`)

  return { updated, unchanged, failed }
}

async function main() {
  const args = process.argv.slice(2)
  const onlyIndex = args.indexOf('--only')
  let only
  if (onlyIndex !== -1) {
    only = args[onlyIndex + 1]
    if (!only) throw new Error('content:refresh: --only requires a source name')
  }

  const result = await refreshContent({ only })
  if (result.failed.length > 0) process.exit(1)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
