import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { packUi } from './pack-ui.mjs'

const css = `
@font-face { font-family: 'Suisse Intl'; src: url('@n3wth/ui/fonts/SuisseIntl-Book.woff2'); }
@font-face {
  font-family: 'Suisse Intl';
  src: url(@n3wth/ui/fonts/SuisseIntl-BookItalic.woff2);
}
@font-face { font-family: 'Geist Mono'; src: url("@n3wth/ui/fonts/GeistMono-Regular.woff2"); }
@font-face { font-family: 'Geist Mono'; src: url('@n3wth/ui/fonts/GeistMono-Medium.woff2'); }
@font-face { font-family: 'Local Suisse'; src: local('Suisse Intl'); }
body { font-family: 'Suisse Intl', system-ui, sans-serif; }
`

function fixture(context) {
  const root = mkdtempSync(join(tmpdir(), 'n3wth-pack-test-'))
  context.after(() => rmSync(root, { recursive: true, force: true }))
  const source = join(root, 'packages/ui')
  const manifest = {
    name: '@n3wth/ui',
    version: '0.0.0',
    files: ['dist', 'public/fonts/GeistMono-*.woff2'],
    scripts: { prepack: 'node -e "throw new Error(\'pack lifecycle must not run\')"' },
  }
  const contents = {
    'package.json': JSON.stringify(manifest),
    'README.md': 'Automatically included by npm',
    'dist/index.js': 'export const unchanged = true',
    'dist/site.css': css,
    'dist/styles.css': css,
    'src/site/site.css': css,
    'public/fonts/GeistMono-Regular.woff2': 'regular fixture',
    'public/fonts/GeistMono-Medium.woff2': 'medium fixture',
    'public/fonts/SuisseIntl-Book.woff2': 'excluded fixture',
    'public/fonts/SuisseIntl-BookItalic.woff2': 'excluded fixture',
    '.env': 'DO_NOT_PACK=1',
  }
  for (const [file, content] of Object.entries(contents)) {
    mkdirSync(dirname(join(source, file)), { recursive: true })
    writeFileSync(join(source, file), content)
  }
  return { root, source, manifest, contents }
}

test('packs npm’s allowlist with fallback CSS and Geist Mono without changing workspace files', context => {
  const { root, source, contents } = fixture(context)
  const packed = packUi(root)
  const archive = join(root, '.release', packed.filename)
  const files = execFileSync('tar', ['-tf', archive], { encoding: 'utf8' }).trim().split('\n').sort()
  assert.deepEqual(files, [
    'package/README.md', 'package/package.json', 'package/dist/index.js',
    'package/dist/site.css', 'package/dist/styles.css',
    'package/public/fonts/GeistMono-Regular.woff2', 'package/public/fonts/GeistMono-Medium.woff2',
  ].sort())
  for (const file of ['dist/site.css', 'dist/styles.css']) {
    const emitted = execFileSync('tar', ['-xOf', archive, `package/${file}`], { encoding: 'utf8' })
    assert.doesNotMatch(emitted, /SuisseIntl-|@n3wth\/ui\/fonts\//)
    assert.match(emitted, /url\("\.\.\/public\/fonts\/GeistMono-Regular\.woff2"\)/)
    assert.match(emitted, /url\('\.\.\/public\/fonts\/GeistMono-Medium\.woff2'\)/)
    assert.ok(emitted.includes("@font-face { font-family: 'Local Suisse'; src: local('Suisse Intl'); }"))
    assert.ok(emitted.includes("body { font-family: 'Suisse Intl', system-ui, sans-serif; }"))
  }
  assert.equal(execFileSync('tar', ['-xOf', archive, 'package/dist/index.js'], { encoding: 'utf8' }), contents['dist/index.js'])
  assert.equal(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }), contents['package.json'])
  for (const [file, content] of Object.entries(contents)) assert.equal(readFileSync(join(source, file), 'utf8'), content, `${file} changed`)
})

test('refuses to pack Suisse binaries when the allowlist expands', context => {
  const { root, source, manifest } = fixture(context)
  manifest.files.push('public/fonts/SuisseIntl-*.woff2')
  writeFileSync(join(source, 'package.json'), JSON.stringify(manifest))
  assert.throws(() => packUi(root), /Suisse binaries must remain excluded/)
  assert.ok(!existsSync(join(root, '.release/n3wth-ui-0.0.0.tgz')))
})

test('rejects unexpected Suisse URLs instead of stripping non-font-face rules', context => {
  const { root, source } = fixture(context)
  const unexpected = `${css}\n.icon { background: url('@n3wth/ui/fonts/SuisseIntl-Book.woff2'); }`
  writeFileSync(join(source, 'dist/site.css'), unexpected)
  assert.throws(() => packUi(root), /unexpected Suisse URL outside excluded font-face blocks/)
  assert.equal(readFileSync(join(source, 'dist/site.css'), 'utf8'), unexpected)
  assert.ok(!existsSync(join(root, '.release/n3wth-ui-0.0.0.tgz')))
})
