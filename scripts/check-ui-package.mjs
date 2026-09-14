import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFileSync, spawn } from 'node:child_process'
import { chromium } from '@playwright/test'

const root = process.cwd()
const manifest = JSON.parse(readFileSync('packages/ui/package.json', 'utf8'))
const starter = 'packages/ui/v0/n3wth-ui/assets/starter'
assert.equal(JSON.parse(readFileSync(`${starter}/package.json`, 'utf8')).dependencies['@n3wth/ui'], manifest.version, 'Starter must use the release version')
mkdirSync('.release', { recursive: true })
const packed = JSON.parse(execFileSync('npm', ['pack', '--workspace', '@n3wth/ui', '--ignore-scripts', '--json', '--pack-destination', '.release'], { encoding: 'utf8' }))[0]
const files = new Set(packed.files.map(file => file.path))
for (const target of Object.values(manifest.exports)) {
  for (const value of typeof target === 'string' ? [target] : Object.values(target)) {
    if (value.includes('*')) continue
    assert.ok(files.has(value.replace(/^\.\//, '')), `Missing export: ${value}`)
  }
}
for (const file of ['v0/n3wth-ui/SKILL.md', 'v0/n3wth-ui/v0.json', 'v0/n3wth-ui/assets/starter/src/main.tsx']) assert.ok(files.has(file), `Missing ${file}`)
assert.ok([...files].some(file => file.startsWith('public/fonts/') && file.endsWith('.woff2')), 'Missing fonts')
assert.ok(![...files].some(file => /(^|\/)\.env/.test(file)), 'Environment file in package')

const directory = mkdtempSync(resolve(tmpdir(), 'n3wth-ui-consumer-'))
let server
let browser
try {
  cpSync(starter, directory, { recursive: true })
  const consumer = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
  consumer.dependencies['@n3wth/ui'] = `file:${resolve('.release', packed.filename)}`
  writeFileSync(resolve(directory, 'package.json'), JSON.stringify(consumer, null, 2))
  execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: directory, stdio: 'inherit' })
  assert.ok(existsSync(resolve(directory, 'node_modules/@n3wth/ui/dist/site/index.js')))
  execFileSync('npm', ['run', 'build'], { cwd: directory, stdio: 'inherit' })
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4187', '--strictPort'], { cwd: directory, stdio: 'pipe' })
  await new Promise((resolveReady, reject) => {
    const timeout = setTimeout(() => reject(new Error('Starter server timeout')), 15000)
    server.on('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)) })
    server.stdout.on('data', chunk => { if (chunk.toString().includes('127.0.0.1:4187')) { clearTimeout(timeout); resolveReady() } })
  })
  browser = await chromium.launch()
  const errors = []
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://127.0.0.1:4187')
    await page.getByRole('heading', { name: 'Build with n3wth UI' }).waitFor()
    await page.evaluate(() => document.fonts.ready)
    for (const mode of ['dark', 'light']) {
      if (mode === 'light') await page.getByRole('button', { name: 'Light', exact: true }).click()
      await page.getByRole('button', { name: 'Try the button' }).click()
      assert.equal(await page.locator('output').textContent(), `Clicked ${mode === 'dark' ? 1 : 2} times`)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow')
      await page.screenshot({ path: resolve(root, `.release/starter-${width}-${mode}.png`), fullPage: true })
    }
  }
  assert.deepEqual(errors, [], 'Consumer browser errors')
  console.log(`Verified ${manifest.name}@${manifest.version}: tarball exports, CSS, fonts, standalone build, both themes and viewports`)
} finally {
  await browser?.close()
  server?.kill()
  rmSync(directory, { recursive: true, force: true })
}
