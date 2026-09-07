import { readFileSync, readdirSync } from 'node:fs'
import { resolve, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

function linkedDependency(workspace, name, packages, byPath) {
  if (!packages || !packages[workspace.path]) return undefined
  let directory = workspace.path
  while (true) {
    const entry = packages[posix.join(directory, 'node_modules', name)]
    if (entry) {
      if (entry.link && typeof entry.resolved === 'string') {
        return byPath.get(posix.normalize(entry.resolved))?.name
      }
      // A registry package shadows the root workspace link.
      if (typeof entry.version === 'string') return null
      return undefined
    }
    if (!directory) return undefined
    directory = posix.dirname(directory)
    if (directory === '.') directory = ''
  }
}

export function affectedWorkspaces(workspaces, files, all = false, lockfile, deployment = false) {
  const byName = new Map(workspaces.map(workspace => [workspace.name, workspace]))
  const byPath = new Map(workspaces.map(workspace => [workspace.path, workspace]))
  const dependencies = workspace => Object.keys({ ...workspace.dependencies, ...workspace.devDependencies, ...workspace.optionalDependencies, ...workspace.peerDependencies }).flatMap(name => {
    const linked = linkedDependency(workspace, name, lockfile?.packages, byPath)
    if (linked === null) return []
    if (linked !== undefined) return [linked]
    // Missing or incomplete lock data must never suppress a possible consumer.
    return byName.has(name) ? [name] : []
  })
  const selected = new Set()
  for (const file of files) {
    // Root validation assets do not change deployed output. Unknown configuration
    // remains conservative; application files (including public docs) still build.
    if (deployment && /^(\.github\/|tests\/|playwright[^/]*\.config\.|scripts\/.*\.test\.mjs$)/.test(file)) continue
    const browserTarget = file.match(/^tests\/browser\/(portfolio|ui-docs|kit|r3-web)\.spec\.ts$/)?.[1]
      || (/^(tests\/garden\/|playwright\.garden\.config\.ts$)/.test(file) ? 'garden' : undefined)
      || (file === 'playwright.r3.config.ts' ? 'r3-web' : undefined)
    if (browserTarget && byName.has(`@n3wth/${browserTarget}`)) {
      selected.add(`@n3wth/${browserTarget}`)
      continue
    }
    // Manifest edits can remove dependency edges. Validate the complete graph.
    if (file.endsWith('/package.json') || file === 'package.json' || file === 'package-lock.json') all = true
    const workspace = workspaces.find(item => file.startsWith(`${item.path}/`))
    if (workspace) selected.add(workspace.name)
    else if (!/^(docs\/|.*\.(md|mdx)$)/.test(file)) all = true
  }
  if (all) for (const workspace of workspaces) selected.add(workspace.name)
  // A change in a shared package affects every transitive consumer.
  let changed = true
  while (changed) {
    changed = false
    for (const workspace of workspaces) {
      if (!selected.has(workspace.name) && dependencies(workspace).some(name => selected.has(name))) {
        selected.add(workspace.name)
        changed = true
      }
    }
  }
  // Include prerequisites so clean CI never relies on stale package output.
  const ordered = []
  const visited = new Set()
  const visiting = new Set()
  const visit = name => {
    if (visited.has(name)) return
    if (visiting.has(name)) throw new Error(`Workspace dependency cycle at ${name}`)
    visiting.add(name)
    for (const dependency of dependencies(byName.get(name))) visit(dependency)
    visiting.delete(name)
    visited.add(name)
    ordered.push(name)
  }
  for (const name of selected) visit(name)
  return ordered
}

function readWorkspaces(root) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  const patterns = Array.isArray(manifest.workspaces) ? manifest.workspaces : manifest.workspaces?.packages
  if (!patterns?.length) throw new Error('Root package.json must declare workspaces')
  return patterns.flatMap(pattern => {
    if (!pattern.endsWith('/*')) return [pattern]
    return readdirSync(resolve(root, pattern.slice(0, -2)), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => `${pattern.slice(0, -1)}${entry.name}`)
  }).map(path => ({ ...JSON.parse(readFileSync(resolve(root, path, 'package.json'), 'utf8')), path }))
}

function main() {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const args = process.argv.slice(2)
  const baseIndex = args.indexOf('--base')
  const base = baseIndex >= 0 ? args[baseIndex + 1] : undefined
  let all = args.includes('--all') || !base || /^0+$/.test(base)
  let files = []
  if (!all) {
    const diff = spawnSync('git', ['diff', '--name-only', '-z', `${base}...HEAD`, '--'], { cwd: root, encoding: 'utf8' })
    if (diff.status !== 0) {
      console.warn('Unable to resolve comparison base; checking every workspace.')
      all = true
    } else files = diff.stdout.split('\0').filter(Boolean)
  }
  let lockfile
  try {
    lockfile = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'))
  } catch {
    console.warn('Unable to read workspace lockfile; checking every workspace.')
    all = true
  }
  const selected = affectedWorkspaces(readWorkspaces(root), files, all, lockfile, args.includes('--deployment'))
  console.log(JSON.stringify(selected))
  if (args.includes('--list')) return
  for (const workspace of selected) {
    const result = spawnSync('npm', ['run', 'check', '--workspace', workspace], { cwd: root, stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status ?? 1)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
