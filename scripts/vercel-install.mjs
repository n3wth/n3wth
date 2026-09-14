import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

// npm install preserves Vercel's restored node_modules. CI still uses npm ci.
// Fail closed if npm needs to change the committed dependency resolution.
function dependencyResolution(bytes) {
  const lock = JSON.parse(bytes)
  // npm records undeclared files bundled inside installed packages as
  // extraneous entries. They are not dependency resolutions (PostHog ships
  // such a nested prettier package). Do not persist this machine inventory.
  for (const [path, entry] of Object.entries(lock.packages ?? {})) {
    if (entry.extraneous) delete lock.packages[path]
  }
  return JSON.stringify(lock)
}

export function installPortfolio(root, spawn = spawnSync) {
  const lockPath = resolve(root, 'package-lock.json')
  const before = readFileSync(lockPath)
  const result = spawn('npx', [
    '--prefer-offline', '--yes', 'npm@11.19.1', 'install',
    '--workspace=@n3wth/portfolio', '--workspace=@n3wth/ui',
    '--workspace=@n3wth/site-config', '--include-workspace-root=false',
    '--include=dev', '--prefer-offline', '--no-audit', '--no-fund',
  ], { cwd: root, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Dependency install failed (${result.status})`)
  const after = readFileSync(lockPath)
  if (dependencyResolution(before) !== dependencyResolution(after)) {
    throw new Error('Install changed package-lock.json. Regenerate it with npm 11.19.1 and commit it before deploying.')
  }
  if (!before.equals(after)) writeFileSync(lockPath, before)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  installPortfolio(fileURLToPath(new URL('../', import.meta.url)))
}
