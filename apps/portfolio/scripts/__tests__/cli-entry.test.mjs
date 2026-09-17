// Regression test for the CLI entry guard in verify-content.mjs and
// refresh-content.mjs: `import.meta.url === `file://${process.argv[1]}``
// compares a raw path to a percent-encoded URL, so it silently stays false
// (and `main()` never runs) whenever the checkout path contains a space or
// another URL-special character. Both scripts must use the
// `resolve(process.argv[1]) === fileURLToPath(import.meta.url)` pattern
// instead, which is exercised here from a directory whose path contains a
// space.
import { describe, it, expect, afterEach } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, mkdirSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url)) + '/..'

let workDir

afterEach(() => {
  if (workDir) rmSync(workDir, { recursive: true, force: true })
  workDir = undefined
})

/**
 * Copies the scripts under test into a fresh checkout whose path has a
 * space in it, preserving the real repo layout (scripts/, scripts/lib/,
 * src/data/ as siblings) so each script's own `../src/data` resolution
 * still lines up.
 */
function makeSpacyCheckout() {
  const root = mkdtempSync(join(tmpdir(), 'content-cli-'))
  workDir = join(root, 'has space')
  const scriptsDir = join(workDir, 'scripts')
  mkdirSync(scriptsDir, { recursive: true })
  cpSync(join(SCRIPTS_DIR, 'verify-content.mjs'), join(scriptsDir, 'verify-content.mjs'))
  cpSync(join(SCRIPTS_DIR, 'refresh-content.mjs'), join(scriptsDir, 'refresh-content.mjs'))
  cpSync(join(SCRIPTS_DIR, 'lib'), join(scriptsDir, 'lib'), { recursive: true })
  return scriptsDir
}

describe('verify-content.mjs CLI entry', () => {
  it('runs main() and exits non-zero on missing snapshots even from a path with a space', () => {
    const scriptsDir = makeSpacyCheckout()
    mkdirSync(join(scriptsDir, '../src/data'), { recursive: true })

    const result = spawnSync(process.execPath, ['verify-content.mjs'], { cwd: scriptsDir, encoding: 'utf8' })

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('problem(s) found')
  })
})

describe('refresh-content.mjs CLI entry', () => {
  it('runs main() and exits non-zero for an unknown --only source even from a path with a space', () => {
    const scriptsDir = makeSpacyCheckout()

    const result = spawnSync(
      process.execPath,
      ['refresh-content.mjs', '--only', 'not-a-real-source'],
      { cwd: scriptsDir, encoding: 'utf8' }
    )

    expect(result.status).not.toBe(0)
  })

  it('errors when --only is given without a value instead of silently refreshing everything', () => {
    const scriptsDir = makeSpacyCheckout()

    const result = spawnSync(process.execPath, ['refresh-content.mjs', '--only'], {
      cwd: scriptsDir,
      encoding: 'utf8',
    })

    expect(result.status).not.toBe(0)
  })
})
