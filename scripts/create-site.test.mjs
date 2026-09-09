import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSite } from './create-site.mjs'

test('site generator uses shared components, escapes titles, rejects traversal and preserves existing apps', () => {
  const root = mkdtempSync(join(tmpdir(), 'n3wth-site-'))
  try {
    for (const path of ['packages/ui', 'apps/portfolio']) mkdirSync(join(root, path), { recursive: true })
    writeFileSync(join(root, 'packages/ui/package.json'), JSON.stringify({ version: '0.9.2' }))
    writeFileSync(join(root, 'apps/portfolio/package.json'), JSON.stringify({ dependencies: { react: '19.2.7', 'react-dom': '19.2.7' }, devDependencies: { vite: '7.3.5', typescript: '5.9.3', '@types/react': '19.2.9', '@types/react-dom': '19.2.3', '@vitejs/plugin-react': '5.1.4' } }))
    assert.throws(() => createSite(root, '../escape'))
    const title = 'Idea "one"\nnext'
    const path = createSite(root, 'new-idea', title)
    const source = readFileSync(join(path, 'src/main.tsx'), 'utf8')
    assert.ok(source.includes(`const title = ${JSON.stringify(title)}`))
    assert.ok(source.includes("from '@n3wth/ui/site'"))
    assert.equal(JSON.parse(readFileSync(join(path, 'package.json'))).dependencies['@n3wth/ui'], '0.9.2')
    const deployment = JSON.parse(readFileSync(join(path, 'vercel.json')))
    assert.ok(deployment.buildCommand.indexOf('--workspace @n3wth/ui') < deployment.buildCommand.indexOf('--workspace @n3wth/new-idea'))
    assert.equal(deployment.outputDirectory, 'dist')
    assert.throws(() => createSite(root, 'new-idea'))
    assert.equal(readFileSync(join(path, 'src/main.tsx'), 'utf8'), source)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
