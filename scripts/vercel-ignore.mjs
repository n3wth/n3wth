import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

// Vercel uses 0 to skip a deployment and 1 to build it.
export function deploymentExitCode(workspace, previousSha, run = spawnSync) {
  if (!workspace || !previousSha || /^0+$/.test(previousSha)) return 1
  try {
    const result = run(process.execPath, [resolve(root, 'scripts/affected.mjs'), '--base', previousSha, '--list', '--deployment'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 30_000,
    })
    if (result.error || result.status !== 0) return 1
    const affected = JSON.parse(result.stdout)
    if (!Array.isArray(affected) || !affected.every(name => typeof name === 'string')) return 1
    return affected.includes(workspace) ? 1 : 0
  } catch {
    return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = deploymentExitCode(process.argv[2], process.env.VERCEL_GIT_PREVIOUS_SHA)
  console.log(process.exitCode === 0 ? 'No affected app changes; skipping deployment.' : 'Building deployment.')
}
