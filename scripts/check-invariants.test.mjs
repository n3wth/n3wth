import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkInvariants, checkNativeOptionals } from './check-invariants.mjs'

const repo = fileURLToPath(new URL('../', import.meta.url))
const sites = ['garden', 'kit', 'portfolio', 'r3-web', 'skills', 'ui-docs']

test('Mac-only native lockfiles cannot pass checks for Linux deployments', () => {
  const packages = {
    'node_modules/@tailwindcss/oxide': { optionalDependencies: {
      '@tailwindcss/oxide-darwin-arm64': '4.3.3',
      '@tailwindcss/oxide-linux-x64-gnu': '4.3.3',
    } },
    'node_modules/@tailwindcss/oxide-darwin-arm64': { version: '4.3.3' },
  }
  assert.match(checkNativeOptionals(packages).join('\n'), /oxide-linux-x64-gnu@4\.3\.3/)
  packages['node_modules/@tailwindcss/oxide-linux-x64-gnu'] = { version: '4.3.3' }
  assert.deepEqual(checkNativeOptionals(packages), [])
})

test('native versions resolve from their package location, including nested copies', () => {
  const packages = {
    'apps/site/node_modules/next': { optionalDependencies: { '@next/swc-linux-x64-gnu': '16.2.9' } },
    'node_modules/@next/swc-linux-x64-gnu': { version: '15.5.19' },
  }
  assert.equal(checkNativeOptionals(packages).length, 1)
  packages['apps/site/node_modules/@next/swc-linux-x64-gnu'] = { version: '16.2.9' }
  assert.deepEqual(checkNativeOptionals(packages), [])
})

function writeWorkspace(root, path, manifest) {
  mkdirSync(join(root, path), { recursive: true })
  writeFileSync(join(root, path, 'package.json'), JSON.stringify(manifest))
}

function fixture(setup) {
  const root = mkdtempSync(join(tmpdir(), 'n3wth-invariants-'))
  writeFileSync(join(root, 'package.json'), JSON.stringify({ workspaces: ['apps/*', 'packages/*'] }))
  mkdirSync(join(root, 'apps'))
  mkdirSync(join(root, 'packages'))
  setup(root)
  return root
}

function validGraph(root, extra = () => {}) {
  writeWorkspace(root, 'packages/ui', { name: '@n3wth/ui', version: '0.9.2' })
  writeWorkspace(root, 'packages/site-config', { name: '@n3wth/site-config', version: '0.0.0' })
  writeWorkspace(root, 'apps/site', {
    name: '@n3wth/site',
    dependencies: { '@n3wth/ui': '0.9.2', '@n3wth/site-config': '*' },
  })
  extra(root)
}

function rejects(root, pattern) {
  try { assert.throws(() => checkInvariants(root), pattern) }
  finally { rmSync(root, { recursive: true, force: true }) }
}

test('current repository keeps unique names, internal deps and a complete root build', () => {
  const workspaces = checkInvariants(repo)
  const apps = workspaces.filter(workspace => workspace.path.startsWith('apps/')).map(workspace => workspace.path.replace('apps/', ''))
  for (const site of sites) assert.ok(apps.includes(site), `missing site workspace ${site}`)
  assert.equal(workspaces.filter(workspace => workspace.path.startsWith('apps/') && workspace.scripts?.build).length, 6)
})

test('hardcoded root builds fail instead of omitting apps', () => {
  rejects(fixture(root => {
    validGraph(root)
    writeFileSync(join(root, 'package.json'), JSON.stringify({
      workspaces: ['apps/*', 'packages/*'],
      scripts: { build: 'npm run build:ui && npm run build:portfolio' },
    }))
  }), /package.json: build must use scripts\/build.mjs so every app is included/)
})

test('accepts a valid workspace graph', () => {
  const root = fixture(validGraph)
  try { assert.equal(checkInvariants(root).length, 3) }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('ignores nested package names outside the workspace glob', () => {
  const root = fixture(root => {
    validGraph(root)
    writeWorkspace(root, 'apps/site/cli', { name: '@n3wth/site' })
  })
  try { assert.doesNotThrow(() => checkInvariants(root)) }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('duplicate workspace names fail with both manifests', () => {
  rejects(fixture(root => {
    validGraph(root)
    writeWorkspace(root, 'apps/copy', { name: '@n3wth/site' })
  }), /apps\/copy\/package.json: duplicate workspace name @n3wth\/site also declared in apps\/site\/package.json/)
})

test('range specifiers are not valid explicit internal dependencies', () => {
  rejects(fixture(root => {
    validGraph(root, root => {
      writeWorkspace(root, 'apps/site', {
        name: '@n3wth/site',
        dependencies: { '@n3wth/ui': '^0.9.2', '@n3wth/site-config': '*' },
      })
    })
  }), /apps\/site\/package.json: @n3wth\/ui must be "\*", "workspace:\*", or 0.9.2 to use the workspace package/)
})

test('packages cannot depend on applications', () => {
  rejects(fixture(root => {
    validGraph(root, root => {
      writeWorkspace(root, 'packages/ui', { name: '@n3wth/ui', version: '0.9.2', dependencies: { '@n3wth/site': '*' } })
    })
  }), /packages\/ui\/package.json: packages must not depend on application @n3wth\/site/)
})

test('applications cannot depend on other applications', () => {
  rejects(fixture(root => {
    validGraph(root)
    writeWorkspace(root, 'apps/other', {
      name: '@n3wth/other',
      dependencies: { '@n3wth/site': '*' },
    })
  }), /apps\/other\/package.json: applications must not depend on application @n3wth\/site/)
})

test('reuses the design-boundary Astryx dependency check with a file path', () => {
  rejects(fixture(root => {
    validGraph(root, root => {
      writeWorkspace(root, 'apps/site', {
        name: '@n3wth/site',
        dependencies: { '@n3wth/ui': '0.9.2', '@astryxdesign/core': '0.1.6' },
      })
    })
  }), /apps\/site\/package.json: Astryx dependencies belong in @n3wth\/ui/)
})

test('reports every violation instead of stopping at the first', () => {
  const root = fixture(root => {
    writeWorkspace(root, 'packages/ui', { name: '@n3wth/ui', version: '0.9.2', dependencies: { '@n3wth/one': '*' } })
    writeWorkspace(root, 'apps/one', { name: '@n3wth/one' })
    writeWorkspace(root, 'apps/two', { name: '@n3wth/one' })
  })
  try {
    assert.throws(() => checkInvariants(root), /apps\/one\/package.json: duplicate workspace name @n3wth\/one also declared in apps\/two\/package.json/)
    assert.throws(() => checkInvariants(root), /packages\/ui\/package.json: packages must not depend on application @n3wth\/one/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
