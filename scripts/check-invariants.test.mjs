import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkInvariants } from './check-invariants.mjs'

const repo = fileURLToPath(new URL('../', import.meta.url))
const sites = ['garden', 'kit', 'portfolio', 'r3-web', 'skills', 'ui-docs']

function writeWorkspace(root, path, manifest, vercel) {
  mkdirSync(join(root, path), { recursive: true })
  writeFileSync(join(root, path, 'package.json'), JSON.stringify(manifest))
  if (vercel !== undefined) writeFileSync(join(root, path, 'vercel.json'), JSON.stringify(vercel))
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
  }, { git: { deploymentEnabled: true } })
  extra(root)
}

function rejects(root, pattern) {
  try { assert.throws(() => checkInvariants(root), pattern) }
  finally { rmSync(root, { recursive: true, force: true }) }
}

test('current repository keeps unique names, internal deps, six automatic site deployments and a complete root build', () => {
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
    writeWorkspace(root, 'apps/copy', { name: '@n3wth/site' }, { git: { deploymentEnabled: true } })
  }), /apps\/copy\/package.json: duplicate workspace name @n3wth\/site also declared in apps\/site\/package.json/)
})

test('disabled or mapped git deployments fail on the vercel.json file', () => {
  rejects(fixture(root => {
    validGraph(root, root => {
      writeWorkspace(root, 'apps/site', {
        name: '@n3wth/site',
        dependencies: { '@n3wth/ui': '0.9.2', '@n3wth/site-config': '*' },
      }, { git: { deploymentEnabled: { main: false } } })
    })
  }), /apps\/site\/vercel.json: git.deploymentEnabled must be true/)
})

test('missing site vercel.json fails on that path', () => {
  rejects(fixture(root => {
    writeWorkspace(root, 'packages/ui', { name: '@n3wth/ui', version: '0.9.2' })
    writeWorkspace(root, 'apps/site', { name: '@n3wth/site', dependencies: { '@n3wth/ui': '0.9.2' } })
  }), /apps\/site\/vercel.json: git.deploymentEnabled must be true/)
})

test('range specifiers are not valid explicit internal dependencies', () => {
  rejects(fixture(root => {
    validGraph(root, root => {
      writeWorkspace(root, 'apps/site', {
        name: '@n3wth/site',
        dependencies: { '@n3wth/ui': '^0.9.2', '@n3wth/site-config': '*' },
      }, { git: { deploymentEnabled: true } })
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
    }, { git: { deploymentEnabled: true } })
  }), /apps\/other\/package.json: applications must not depend on application @n3wth\/site/)
})

test('reuses the design-boundary Astryx dependency check with a file path', () => {
  rejects(fixture(root => {
    validGraph(root, root => {
      writeWorkspace(root, 'apps/site', {
        name: '@n3wth/site',
        dependencies: { '@n3wth/ui': '0.9.2', '@astryxdesign/core': '0.1.6' },
      }, { git: { deploymentEnabled: true } })
    })
  }), /apps\/site\/package.json: Astryx dependencies belong in @n3wth\/ui/)
})

test('reports every violation instead of stopping at the first', () => {
  const root = fixture(root => {
    writeWorkspace(root, 'packages/ui', { name: '@n3wth/ui', version: '0.9.2', dependencies: { '@n3wth/one': '*' } })
    writeWorkspace(root, 'apps/one', { name: '@n3wth/one' }, { git: { deploymentEnabled: false } })
    writeWorkspace(root, 'apps/two', { name: '@n3wth/one' }, { git: { deploymentEnabled: true } })
  })
  try {
    assert.throws(() => checkInvariants(root), /apps\/one\/package.json: duplicate workspace name @n3wth\/one also declared in apps\/two\/package.json/)
    assert.throws(() => checkInvariants(root), /packages\/ui\/package.json: packages must not depend on application @n3wth\/one/)
    assert.throws(() => checkInvariants(root), /apps\/one\/vercel.json: git.deploymentEnabled must be true/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
