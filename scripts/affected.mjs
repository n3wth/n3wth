import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

export function affectedWorkspaces(workspaces, files, all = false) {
  const byName = new Map(workspaces.map(workspace => [workspace.name, workspace]))
  const dependencies = workspace => Object.keys({ ...workspace.dependencies, ...workspace.devDependencies, ...workspace.peerDependencies }).filter(name => byName.has(name))
  const selected = new Set()
  for (const file of files) {
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
  const selected = affectedWorkspaces(readWorkspaces(root), files, all)
  console.log(JSON.stringify(selected))
  if (args.includes('--list')) return
  for (const workspace of selected) {
    const result = spawnSync('npm', ['run', 'check', '--workspace', workspace], { cwd: root, stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status ?? 1)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
