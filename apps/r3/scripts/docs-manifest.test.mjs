import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildManifest, manifestPath } from "./docs-manifest.mjs";

/* The Worker bundles the committed manifest, so a stale copy ships old
   docs. This test fails until `npm run docs:manifest` regenerates it. */
test("committed docs manifest matches content/docs", () => {
  const fresh = JSON.stringify(buildManifest(), null, 2) + "\n";
  assert.equal(fresh, readFileSync(manifestPath, "utf8"), "run npm run docs:manifest");
});
