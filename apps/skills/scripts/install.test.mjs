import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const installer = fileURLToPath(new URL('../public/install.sh', import.meta.url))
for (const platform of ['gemini']) {
  test(`installer resolves monorepo skills for ${platform}`, () => {
    const temporary = mkdtempSync(join(tmpdir(), 'skills-installer-'))
    try {
      const bin = join(temporary, 'bin')
      const destination = join(temporary, 'home')
      mkdirSync(bin)
      mkdirSync(destination)
      const git = join(bin, 'git')
      writeFileSync(git, `#!/bin/bash
set -eu
test "$1" = clone
test "$4" = https://github.com/n3wth/n3wth.git
mkdir -p "$5/apps/skills/skills/example"
printf 'fixture skill' > "$5/apps/skills/skills/example.md"
printf 'nested skill' > "$5/apps/skills/skills/example/SKILL.md"
`)
      chmodSync(git, 0o755)
      const result = spawnSync('bash', [installer, platform], {
        encoding: 'utf8',
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, SKILLS_INSTALL_HOME: destination },
      })
      assert.equal(result.status, 0, result.stdout + result.stderr)
      assert.equal(readFileSync(join(destination, `.${platform}`, 'skills/example.md'), 'utf8'), 'fixture skill')
      assert.equal(readFileSync(join(destination, `.${platform}`, 'skills/example/SKILL.md'), 'utf8'), 'nested skill')
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  })
}

function withSelectionFixture(check) {
  const temporary = mkdtempSync(join(tmpdir(), 'skills-selection-'))
  try {
    const bin = join(temporary, 'bin')
    const home = join(temporary, 'home')
    mkdirSync(bin)
    mkdirSync(home)
    const git = join(bin, 'git')
    writeFileSync(git, `#!/bin/bash
set -eu
mkdir -p "$5/apps/skills/skills/folder/references"
printf 'flat content' > "$5/apps/skills/skills/flat.md"
printf 'folder content' > "$5/apps/skills/skills/folder/SKILL.md"
printf 'reference' > "$5/apps/skills/skills/folder/references/example.md"
printf 'unselected' > "$5/apps/skills/skills/other.md"
`)
    chmodSync(git, 0o755)
    const run = args => spawnSync('bash', [installer, ...args], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, SKILLS_INSTALL_HOME: home },
    })
    check({ home, run })
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
}

test('bundle selection installs only requested flat and directory skills for Gemini CLI', () => {
  withSelectionFixture(({ home, run }) => {
    mkdirSync(join(home, '.gemini/skills'), { recursive: true })
    writeFileSync(join(home, '.gemini/skills/flat.md'), 'user content')
    const result = run(['all', 'flat', 'folder'])
    assert.equal(result.status, 0, result.stdout + result.stderr)
    for (const assistant of ['gemini']) {
      const dir = join(home, `.${assistant}/skills`)
      assert.equal(readFileSync(join(dir, 'flat.md'), 'utf8'), assistant === 'gemini' ? 'user content' : 'flat content')
      assert.equal(readFileSync(join(dir, 'folder/SKILL.md'), 'utf8'), 'folder content')
      assert.equal(readFileSync(join(dir, 'folder/references/example.md'), 'utf8'), 'reference')
      assert.equal(existsSync(join(dir, 'other.md')), false)
    }
  })
})

test('invalid or missing selections fail before writing any skills', () => {
  for (const invalid of ['missing', '../folder']) {
    withSelectionFixture(({ home, run }) => {
      const result = run(['gemini', 'flat', invalid])
      assert.notEqual(result.status, 0)
      assert.equal(existsSync(join(home, '.gemini')), false)
    })
  }
})

test('unfiltered Gemini install preserves directory skills', () => {
  withSelectionFixture(({ home, run }) => {
    const result = run(['all'])
    assert.equal(result.status, 0, result.stdout + result.stderr)
    for (const assistant of ['gemini']) {
      assert.equal(readFileSync(join(home, `.${assistant}/skills/folder/SKILL.md`), 'utf8'), 'folder content')
    }
  })
})

test('unsupported assistant targets fail without modifying the destination', () => {
  withSelectionFixture(({ home, run }) => {
    const result = run(['unsupported', 'flat'])
    assert.notEqual(result.status, 0)
    assert.equal(existsSync(join(home, '.gemini')), false)
  })
})
