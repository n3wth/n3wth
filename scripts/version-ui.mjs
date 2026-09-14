import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

execFileSync('npx', ['changeset', 'version'], { stdio: 'inherit' })
const { version } = JSON.parse(readFileSync('packages/ui/package.json', 'utf8'))
const path = 'packages/ui/v0/n3wth-ui/assets/starter/package.json'
const starter = JSON.parse(readFileSync(path, 'utf8'))
starter.dependencies['@n3wth/ui'] = version
writeFileSync(path, JSON.stringify(starter, null, 2) + '\n')
execFileSync('npm', ['install', '--package-lock-only', '--ignore-scripts'], { stdio: 'inherit' })
