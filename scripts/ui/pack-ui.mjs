import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const suisseBinary = /(?:^|\/)SuisseIntl-[^/]+\.(?:woff2?|ttf|otf)$/i
const packageFontUrl = /url\(\s*(['"]?)@n3wth\/ui\/fonts\/([^'"\s)]+)\1\s*\)/g

export function packUi(root = process.cwd()) {
  const source = resolve(root, 'packages/ui')
  const destination = resolve(root, '.release')
  const options = { cwd: source, encoding: 'utf8' }
  const [allowlist] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], options))
  assert.ok(!allowlist.files.some(file => suisseBinary.test(file.path)), 'Suisse binaries must remain excluded from the npm package')
  const stage = mkdtempSync(join(tmpdir(), 'n3wth-ui-pack-'))
  try {
    for (const file of allowlist.files) {
      const target = join(stage, file.path)
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(join(source, file.path), target)
    }
    for (const file of ['dist/site.css', 'dist/styles.css']) {
      const target = join(stage, file)
      const css = readFileSync(target, 'utf8')
        .replace(/@font-face\s*\{[^{}]*\}/g, block => {
          const excluded = [...block.matchAll(packageFontUrl)].some(match => suisseBinary.test(match[2]))
          return excluded ? '' : block
        })
        .replace(packageFontUrl, (_match, quote, name) => `url(${quote}../public/fonts/${name}${quote})`)
      assert.doesNotMatch(css, /url\([^)]*SuisseIntl-/i, `${file}: unexpected Suisse URL outside excluded font-face blocks`)
      writeFileSync(target, css)
    }
    mkdirSync(destination, { recursive: true })
    const [packed] = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', destination], { cwd: stage, encoding: 'utf8' }))
    assert.deepEqual(packed.files.map(file => file.path).sort(), allowlist.files.map(file => file.path).sort(), 'Staged tarball must contain exactly npm’s allowlisted files')
    return packed
  } finally {
    rmSync(stage, { recursive: true, force: true })
  }
}
