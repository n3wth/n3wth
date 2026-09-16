import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readWorkspaces } from './affected.mjs'
import { buildOrder } from './build.mjs'
import { DEPENDENCY_GROUPS, hasDirectAstryxDependency } from './check-site-design.mjs'

function isApp(workspace) {
  return workspace.path.startsWith('apps/') && !workspace.path.includes('/', 5)
}

function isPackage(workspace) {
  return workspace.path.startsWith('packages/')
}

function isValidInternalSpecifier(declared, workspace) {
  return declared === '*' || declared === 'workspace:*' || declared === workspace.version || declared === `workspace:${workspace.version}`
}

export function checkInvariants(root) {
  const errors = []
  const workspaces = readWorkspaces(root).toSorted((left, right) => left.path.localeCompare(right.path))
  const byName = new Map()
  const pathsByName = new Map()
  for (const workspace of workspaces) {
    const manifest = `${workspace.path}/package.json`
    if (!workspace.name) {
      errors.push(`${manifest}: workspace package name is required`)
      continue
    }
    const paths = pathsByName.get(workspace.name) ?? []
    paths.push(workspace.path)
    pathsByName.set(workspace.name, paths)
    if (!byName.has(workspace.name)) byName.set(workspace.name, workspace)
  }
  for (const [name, paths] of pathsByName) {
    if (paths.length < 2) continue
    const manifests = paths.map(path => `${path}/package.json`)
    errors.push(`${manifests[0]}: duplicate workspace name ${name} also declared in ${manifests.slice(1).join(', ')}`)
  }
  for (const workspace of workspaces) {
    if (!workspace.name) continue
    const manifest = `${workspace.path}/package.json`
    if (isApp(workspace) && hasDirectAstryxDependency(workspace)) {
      errors.push(`${manifest}: Astryx dependencies belong in @n3wth/ui`)
    }
    for (const group of DEPENDENCY_GROUPS) {
      for (const [name, specifier] of Object.entries(workspace[group] || {})) {
        const target = byName.get(name)
        if (!target) continue
        if (isPackage(workspace) && isApp(target)) {
          errors.push(`${manifest}: packages must not depend on application ${name}`)
        }
        if (isApp(workspace) && isApp(target) && target.path !== workspace.path) {
          errors.push(`${manifest}: applications must not depend on application ${name}`)
        }
        if (!isValidInternalSpecifier(specifier, target)) {
          errors.push(`${manifest}: ${name} must be "*", "workspace:*", or ${target.version} to use the workspace package`)
        }
      }
    }
    if (!isApp(workspace)) continue
    const vercelPath = `${workspace.path}/vercel.json`
    const absolute = resolve(root, vercelPath)
    if (!existsSync(absolute)) {
      errors.push(`${vercelPath}: git.deploymentEnabled must be true`)
      continue
    }
    let vercel
    try {
      vercel = JSON.parse(readFileSync(absolute, 'utf8'))
    } catch (error) {
      errors.push(`${vercelPath}: ${error.message}`)
      continue
    }
    if (vercel.git?.deploymentEnabled !== true) {
      errors.push(`${vercelPath}: git.deploymentEnabled must be true`)
    }
  }
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  if (manifest.scripts?.build && manifest.scripts.build !== 'node scripts/build.mjs') {
    errors.push('package.json: build must use scripts/build.mjs so every app is included')
  }
  try {
    const order = buildOrder(workspaces)
    for (const workspace of workspaces) {
      if (!isApp(workspace) || typeof workspace.scripts?.build !== 'string') continue
      if (!order.includes(workspace.name)) {
        errors.push(`package.json: root build omits ${workspace.name}`)
      }
    }
  } catch (error) {
    errors.push(error.message)
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return workspaces
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const workspaces = checkInvariants(fileURLToPath(new URL('../', import.meta.url)))
    const apps = workspaces.filter(isApp)
    console.log(`repository invariants verified (${apps.length} apps, ${workspaces.length} workspaces)`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
