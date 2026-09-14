import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, lstatSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cachePath = 'node_modules/.cache/n3wth-ui-build'

// Hash both names and bytes, so additions, deletions and renames invalidate.
export function hashPaths(root, paths) {
  const hash = createHash('sha256')
  function visit(path) {
    const absolute = resolve(root, path)
    const stat = lstatSync(absolute)
    if (stat.isSymbolicLink()) throw new Error(`Unexpected symlink in build inputs: ${path}`)
    hash.update(`${path}\0`)
    if (stat.isDirectory()) {
      for (const entry of readdirSync(absolute).sort()) visit(`${path}/${entry}`)
    } else {
      const bytes = readFileSync(absolute)
      hash.update(`${bytes.length}\0`).update(bytes)
    }
  }
  for (const path of [...paths].sort()) visit(path)
  return hash.digest('hex')
}

export function uiBuildKey(root, env = process.env, runtime = `${process.version}/${process.platform}/${process.arch}`) {
  const paths = [
    'package.json', 'package-lock.json', 'scripts/build.mjs', 'scripts/ui-build-cache.mjs',
    ...['src', 'scripts', 'public', 'package.json', 'tsconfig.json', 'vite.config.ts', 'tailwind.preset.cjs']
      .map(path => `packages/ui/${path}`),
    ...readdirSync(resolve(root, 'packages/ui')).filter(path => path.startsWith('.env'))
      .map(path => `packages/ui/${path}`),
  ]
  const variables = Object.entries(env).filter(([name]) => name === 'NODE_ENV' || name.startsWith('VITE_')).sort()
  return createHash('sha256').update(JSON.stringify([1, runtime, variables, hashPaths(root, paths)])).digest('hex')
}

export function restoreUiBuild(root, key) {
  const cache = resolve(root, cachePath)
  try {
    const manifest = JSON.parse(readFileSync(resolve(cache, 'manifest.json'), 'utf8'))
    if (manifest.key !== key || manifest.output !== hashPaths(cache, ['dist'])) return false
    // Never merge restored output with stale files from another build.
    rmSync(resolve(root, 'packages/ui/dist'), { recursive: true, force: true })
    cpSync(resolve(cache, 'dist'), resolve(root, 'packages/ui/dist'), { recursive: true })
    return true
  } catch {
    return false
  }
}

export function saveUiBuild(root, key) {
  const cache = resolve(root, cachePath)
  const staging = `${cache}.tmp`
  try {
    rmSync(staging, { recursive: true, force: true })
    mkdirSync(staging, { recursive: true })
    cpSync(resolve(root, 'packages/ui/dist'), resolve(staging, 'dist'), { recursive: true })
    writeFileSync(resolve(staging, 'manifest.json'), JSON.stringify({ key, output: hashPaths(staging, ['dist']) }))
    rmSync(cache, { recursive: true, force: true })
    renameSync(staging, cache)
  } catch (error) {
    console.warn(`UI cache could not be saved: ${error.message}`)
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }
}
