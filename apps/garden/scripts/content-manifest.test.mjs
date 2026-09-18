import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { buildManifest, manifestPath } from './content-manifest.mjs'

/* The worker bundles the committed manifest, so a stale copy silently
   ships old notes to the workerd preview. This test fails CI until
   `npm run content:manifest` regenerates it. */
test('committed content manifest matches the content directory', () => {
  const fresh = JSON.stringify(buildManifest(), null, 2) + '\n'
  assert.equal(fresh, readFileSync(manifestPath, 'utf8'), 'run npm run content:manifest')
})
