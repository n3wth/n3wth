/**
 * Validates the committed content snapshots in src/data/*.json without any
 * network access. This is the portfolio's `prebuild`: it makes sure the
 * source tree that's about to be compiled actually has the shapes every
 * page expects, and fails the build loudly if a snapshot is missing or
 * malformed instead of shipping an empty/placeholder page silently.
 *
 * To update the snapshots themselves, run `npm run content:refresh`
 * (scripts/refresh-content.mjs) — a separate, network-using command that is
 * never part of the build.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SOURCES } from './lib/content-sources.mjs'

const DEFAULT_DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/data')

/**
 * @param {object} [options]
 * @param {string} [options.dataDir]
 * @param {typeof SOURCES} [options.sources]
 * @returns {string[]} one message per problem found, empty when everything is valid
 */
export function verifyContent({ dataDir = DEFAULT_DATA_DIR, sources = SOURCES } = {}) {
  const errors = []

  for (const source of sources) {
    const valueByFile = {}
    let readable = true

    for (const file of source.files) {
      const path = join(dataDir, file)
      if (!existsSync(path)) {
        errors.push(`${file}: missing`)
        readable = false
        continue
      }
      const text = readFileSync(path, 'utf8')
      try {
        valueByFile[file] = JSON.parse(text)
      } catch (err) {
        errors.push(`${file}: invalid JSON (${err instanceof Error ? err.message : String(err)})`)
        readable = false
      }
    }

    if (!readable) continue
    for (const message of source.validate(valueByFile)) errors.push(message)
  }

  return errors
}

function main() {
  const errors = verifyContent({})
  for (const message of errors) console.error(`[verify-content] ${message}`)
  if (errors.length > 0) {
    console.error(
      `[verify-content] ${errors.length} problem(s) found. Run "npm run content:refresh" and commit the result.`
    )
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
