import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFileSync, spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium, expect } from '@playwright/test'
import { packUi } from './pack-ui.mjs'

const root = process.cwd()
const manifest = JSON.parse(readFileSync('packages/ui/package.json', 'utf8'))
const starter = 'packages/ui/v0/n3wth-ui/assets/starter'
const fixtures = resolve('scripts/package-check')
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
assert.equal(manifest.peerDependenciesMeta.gsap.optional, true, 'GSAP must remain optional')
assert.equal(JSON.parse(readFileSync(`${starter}/package.json`, 'utf8')).dependencies['@n3wth/ui'], manifest.version, 'Starter must use the release version')
const packed = packUi(root)
const files = new Set(packed.files.map(file => file.path))
for (const target of Object.values(manifest.exports)) {
  for (const value of typeof target === 'string' ? [target] : Object.values(target)) {
    if (value.includes('*')) continue
    assert.ok(files.has(value.replace(/^\.\//, '')), `Missing export: ${value}`)
  }
}
for (const file of ['v0/n3wth-ui/SKILL.md', 'v0/n3wth-ui/v0.json', 'v0/n3wth-ui/assets/starter/src/main.tsx']) assert.ok(files.has(file), `Missing ${file}`)
assert.ok([...files].some(file => file.startsWith('public/fonts/') && file.endsWith('.woff2')), 'Missing fonts')
assert.ok(![...files].some(file => /SuisseIntl-.*\.(?:woff2?|ttf|otf)$/i.test(file)), 'Suisse binary in package')
for (const weight of ['Regular', 'Medium']) assert.ok(files.has(`public/fonts/GeistMono-${weight}.woff2`), `Missing Geist Mono ${weight}`)
assert.ok(![...files].some(file => /(^|\/)\.env/.test(file)), 'Environment file in package')

const directory = mkdtempSync(resolve(tmpdir(), 'n3wth-ui-consumer-'))
const nextDirectory = mkdtempSync(resolve(tmpdir(), 'n3wth-ui-next-consumer-'))
let server
let browser
async function waitForServer(url) {
  const deadline = Date.now() + 30000
  while (true) {
    if (server.exitCode !== null || server.signalCode) throw new Error(`Server exited: ${server.exitCode ?? server.signalCode}`)
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) })
      if (response.ok) return
    } catch { /* Server is still starting. */ }
    if (Date.now() >= deadline) throw new Error(`Consumer server timeout: ${url}`)
    await delay(100)
  }
}

async function checkRootButton(page) {
  await page.getByRole('button', { name: 'Root button', exact: true }).click()
  await expect(page.getByTestId('root-count')).toHaveText('Root clicks: 1')
}

try {
  cpSync(starter, directory, { recursive: true })
  const consumer = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
  consumer.dependencies['@n3wth/ui'] = `file:${resolve('.release', packed.filename)}`
  writeFileSync(resolve(directory, 'package.json'), JSON.stringify(consumer, null, 2))
  execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: directory, stdio: 'inherit' })
  for (const file of [...files].filter(file => file.endsWith('.css'))) {
    const css = readFileSync(resolve(directory, 'node_modules/@n3wth/ui', file), 'utf8')
    assert.doesNotMatch(css, /url\([^)]*SuisseIntl-/i, `${file}: Suisse URL in installed tarball`)
  }
  for (const file of ['dist/site.css', 'dist/styles.css']) {
    const css = readFileSync(resolve(directory, 'node_modules/@n3wth/ui', file), 'utf8')
    for (const weight of ['Regular', 'Medium']) assert.ok(css.includes(`../public/fonts/GeistMono-${weight}.woff2`), `${file}: missing Geist Mono ${weight} URL`)
  }
  assert.ok(!existsSync(resolve(directory, 'node_modules/gsap')), 'The site/primitives starter must not require GSAP')
  execFileSync('npm', ['run', 'build'], { cwd: directory, stdio: 'inherit' })
  consumer.devDependencies.gsap = lock.packages['node_modules/gsap'].version
  cpSync(resolve(fixtures, 'EntryChecks.tsx'), resolve(directory, 'src/EntryChecks.tsx'))
  cpSync(resolve(fixtures, 'vite-entry.tsx'), resolve(directory, 'src/package-check.tsx'))
  const main = resolve(directory, 'src/main.tsx')
  writeFileSync(main, `${readFileSync(main, 'utf8')}\nimport './package-check'\n`)
  writeFileSync(resolve(directory, 'package.json'), JSON.stringify(consumer, null, 2))
  execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: directory, stdio: 'inherit' })
  assert.ok(existsSync(resolve(directory, 'node_modules/@n3wth/ui/dist/site/index.js')))
  execFileSync('npm', ['run', 'build', '--', '--sourcemap'], { cwd: directory, stdio: 'inherit' })
  const sourceMaps = readdirSync(resolve(directory, 'dist/assets')).filter(file => file.endsWith('.js.map'))
  assert.ok(sourceMaps.length > 0, 'Vite must emit source maps for the tree-shaking check')
  for (const file of sourceMaps) {
    const map = JSON.parse(readFileSync(resolve(directory, 'dist/assets', file), 'utf8'))
    assert.ok(!map.sources.some(source => source.includes('/node_modules/gsap/')), 'Unused motion code must be tree-shaken')
  }
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4187', '--strictPort'], { cwd: directory, stdio: 'inherit' })
  await waitForServer('http://127.0.0.1:4187')
  browser = await chromium.launch()
  const errors = []
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://127.0.0.1:4187')
    await page.getByRole('heading', { name: 'Build with n3wth UI' }).waitFor()
    await checkRootButton(page)
    await expect(page.getByTestId('root-media')).toHaveText(width >= 768 ? 'desktop' : 'mobile')
    await expect(page.getByTestId('package-visual').locator('svg')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    for (const mode of ['dark', 'light']) {
      if (mode === 'light') await page.getByRole('button', { name: 'Light', exact: true }).click()
      await page.getByRole('button', { name: 'Try the button' }).click()
      assert.equal(await page.locator('output').filter({ hasText: /^Clicked / }).textContent(), `Clicked ${mode === 'dark' ? 1 : 2} times`)
      await page.screenshot({ path: resolve(root, `.release/starter-${width}-${mode}.png`), fullPage: true })
      const overflow = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        elements: [...document.querySelectorAll('body *')].filter(element => element.getBoundingClientRect().right > innerWidth).slice(0, 8).map(element => element.outerHTML.slice(0, 200)),
      }))
      assert.ok(overflow.width <= width, `Horizontal overflow: ${JSON.stringify(overflow)}`)
    }
  }
  server.kill()
  cpSync(resolve(fixtures, 'next'), nextDirectory, { recursive: true })
  writeFileSync(resolve(nextDirectory, 'package.json'), JSON.stringify({
    name: 'n3wth-ui-next-consumer',
    private: true,
    type: 'module',
    dependencies: { ...consumer.dependencies, next: lock.packages['node_modules/next'].version },
    devDependencies: { gsap: consumer.devDependencies.gsap },
  }, null, 2))
  execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: nextDirectory, stdio: 'inherit' })
  execFileSync(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], {
    cwd: nextDirectory, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  })
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '4188'], { cwd: nextDirectory, stdio: 'inherit' })
  await waitForServer('http://127.0.0.1:4188')
  await page.emulateMedia({ colorScheme: 'dark' })
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const response = await page.goto('http://127.0.0.1:4188')
    assert.equal(response.status(), 200)
    assert.match(await response.text(), /Server OG entry/)
    assert.match(await response.text(), /Server root entry/)
    await page.getByRole('heading', { name: 'Next packed consumer' }).waitFor()
    await checkRootButton(page)
    await expect(page.getByTestId('server-visual').locator('svg')).toBeVisible()
  }
  assert.deepEqual(errors, [], 'Consumer browser errors')
  console.log(`Verified ${manifest.name}@${manifest.version}: tarball exports; site/primitives starter builds without GSAP; unused GSAP tree-shaken from Vite root/visual build; Vite starter dark/light and root/visual entries dark at 390/1440px; Next server/client imports and hydration dark at 390/1440px`)
} finally {
  await browser?.close()
  server?.kill()
  rmSync(directory, { recursive: true, force: true })
  rmSync(nextDirectory, { recursive: true, force: true })
}
