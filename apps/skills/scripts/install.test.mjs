import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const installer = fileURLToPath(new URL('../public/install.sh', import.meta.url))
for (const platform of ['claude', 'gemini', 'cursor', 'windsurf', 'cody', 'copilot']) {
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
