import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

// Vercel uses 0 to skip a deployment and 1 to build it.
export function deploymentExitCode(workspace, previousSha, run = spawnSync, log = () => {}) {
  if (!workspace || !previousSha || /^0+$/.test(previousSha)) {
    log('No safe comparison base; building conservatively.')
    return 1
  }
  try {
    const result = run(process.execPath, [resolve(root, 'scripts/affected.mjs'), '--base', previousSha, '--list', '--deployment'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 30_000,
    })
    if (result.error || result.status !== 0) {
      log('Affected-workspace comparison failed; building conservatively.')
      return 1
    }
    const affected = JSON.parse(result.stdout)
    if (!Array.isArray(affected) || !affected.every(name => typeof name === 'string')) return 1
    log(`Comparison base ${previousSha}; affected workspaces: ${affected.join(', ') || 'none'}`)
    return affected.includes(workspace) ? 1 : 0
  } catch {
    log('Invalid affected-workspace output; building conservatively.')
    return 1
  }
}

function comparisonBase(env, log) {
  const deadline = Date.now() + 20_000
  const git = args => {
    const remaining = deadline - Date.now()
    if (remaining <= 0) return undefined
    const result = spawnSync('git', args, {
      cwd: root, encoding: 'utf8', timeout: Math.min(10_000, remaining),
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    })
    return result.status === 0 ? result.stdout.trim() : undefined
  }
  const previous = env.VERCEL_GIT_PREVIOUS_SHA
  if (previous && !/^0+$/.test(previous)) {
    if (!/^[a-f0-9]{40}$/i.test(previous)) return undefined
    const resolved = git(['rev-parse', '--verify', `${previous}^{commit}`])
    if (resolved) return resolved
    log('Previous deployment commit is outside the shallow clone; fetching it.')
    git(['fetch', '--no-tags', '--depth=1', 'origin', previous])
    return git(['rev-parse', '--verify', `${previous}^{commit}`])
  }
  // This repository deploys main to production. Only first-time Git previews
  // may compare against its branch point; missing production history must build.
  if (env.VERCEL_ENV !== 'preview' || !env.VERCEL_GIT_COMMIT_REF || env.VERCEL_GIT_COMMIT_REF === 'main') return undefined
  log('First branch preview; comparing changes since branching from main.')
  const head = git(['rev-parse', 'HEAD'])
  if (!head) return undefined
  // Fetch both histories: Vercel may only have the latest ten branch commits.
  if (git(['fetch', '--no-tags', '--depth=100', 'origin', '+refs/heads/main:refs/remotes/origin/main', head]) === undefined) return undefined
  return git(['merge-base', 'refs/remotes/origin/main', 'HEAD'])
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const base = comparisonBase(process.env, console.log)
  process.exitCode = deploymentExitCode(process.argv[2], base, spawnSync, console.log)
  console.log(process.exitCode === 0 ? 'No affected app changes; skipping deployment.' : 'Building deployment.')
}
