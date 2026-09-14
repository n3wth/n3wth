import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const { name, version } = JSON.parse(readFileSync('packages/ui/package.json', 'utf8'))
if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('Publish through the Release UI workflow.')
const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`)
if (response.ok) {
  console.log(`${name}@${version} is already published; nothing to do.`)
} else if (response.status === 404) {
  // Publish the exact tarball installed and tested by check:package.
  execFileSync('npm', ['publish', `.release/n3wth-ui-${version}.tgz`, '--access', 'public', '--provenance'], { stdio: 'inherit' })
} else {
  throw new Error(`Registry lookup failed (${response.status}); refusing to guess release state.`)
}
