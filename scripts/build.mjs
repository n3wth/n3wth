import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { orderSelectedWorkspaces, readWorkspaces } from './affected.mjs'
import { restoreUiBuild, saveUiBuild, uiBuildKey } from './ui-build-cache.mjs'

export function parseBuildArgs(args) {
  const parsed = { list: false, cacheUi: false, workspaces: [] }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--cloudflare') {
      parsed.cloudflare = true
      continue
    }
    if (arg === '--cache-ui') {
      parsed.cacheUi = true
      continue
    }
    if (arg === '--list') {
      parsed.list = true
      continue
    }
    if (arg === '--workspace' || arg === '-w') {
      const name = args[index + 1]
      if (!name || name.startsWith('-')) throw new Error('build --workspace requires a workspace name')
      parsed.workspaces.push(name)
      index += 1
      continue
    }
    if (arg.startsWith('--workspace=')) {
      parsed.workspaces.push(arg.slice('--workspace='.length))
      continue
    }
    throw new Error(`Unknown build argument: ${arg}`)
  }
  return parsed
}

function hasBuildScript(workspace) {
  return typeof workspace?.scripts?.build === 'string' && workspace.scripts.build.length > 0
}

export function buildOrder(workspaces, targets = [], lockfile) {
  const byName = new Map(workspaces.map(workspace => [workspace.name, workspace]))
  const selected = new Set()
  if (targets.length === 0) {
    for (const workspace of workspaces) selected.add(workspace.name)
  } else {
    for (const name of targets) {
      if (!byName.has(name)) throw new Error(`Unknown workspace ${name}`)
      selected.add(name)
    }
  }
  return orderSelectedWorkspaces(workspaces, selected, lockfile).filter(name => hasBuildScript(byName.get(name)))
}

function readLockfile(root) {
  try {
    return JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'))
  } catch {
    return undefined
  }
}

export function workspaceBuildArgs(workspace, cloudflare = false) {
  const openNext = ['garden', 'kit', 'skills', 'r3-web'].map(app => `@n3wth/${app}`)
  return cloudflare && openNext.includes(workspace)
    ? ['exec', '--workspace', workspace, '--', 'opennextjs-cloudflare', 'build']
    : ['run', 'build', '--workspace', workspace]
}

export function checkCloudflareToolchain(nodeVersion = process.versions.node, npmVersion) {
  if (nodeVersion.split('.')[0] !== '24' || npmVersion !== '11.19.1') {
    throw new Error('Cloudflare builds require Node 24 and npm 11.19.1. Run npm ci with these versions first.')
  }
}

export function runWorkspaceBuilds(order, spawn = spawnSync, cwd, { cacheUi = false, cloudflare = false } = {}) {
  for (const workspace of order) {
    const key = cacheUi && workspace === '@n3wth/ui' ? uiBuildKey(cwd) : undefined
    if (key && restoreUiBuild(cwd, key)) {
      console.log('@n3wth/ui: restored verified build cache')
      continue
    }
    if (key) console.log('@n3wth/ui: cache miss; building')
    const result = spawn('npm', workspaceBuildArgs(workspace, cloudflare), { cwd, stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status ?? 1)
    if (key) saveUiBuild(cwd, key)
  }
}

function main() {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const options = parseBuildArgs(process.argv.slice(2))
  if (options.cloudflare && !options.list) {
    const npm = spawnSync('npm', ['--version'], { encoding: 'utf8' })
    if (npm.error) throw npm.error
    checkCloudflareToolchain(process.versions.node, npm.stdout?.trim())
  }
  const order = buildOrder(readWorkspaces(root), options.workspaces, readLockfile(root))
  if (options.list) {
    console.log(JSON.stringify(order))
    return
  }
  runWorkspaceBuilds(order, spawnSync, root, options)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
