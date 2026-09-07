/**
 * Build-time GitHub stats snapshot (runs via npm prebuild).
 *
 * The project cards previously fetched star/fork counts only in the
 * browser and hid them entirely when the request failed — so "five
 * products in production" often shipped with zero numbers. This bakes a
 * snapshot at build time; the client fetch stays as a live refresher.
 *
 * Never fails the build and never invents numbers: on any error the
 * committed snapshot (possibly empty) is left untouched.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/data/github-stats.json')

// Repos referenced by src/data/content.ts project entries
const REPOS = ['n3wth/r3', 'n3wth/kit', 'n3wth/skills']

const current = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'))
  } catch {
    return {}
  }
})()

const next = { ...current }
let changed = false

for (const repo of REPOS) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) continue
    const data = await res.json()
    if (typeof data.stargazers_count !== 'number') continue
    next[repo] = { stars: data.stargazers_count, forks: data.forks_count ?? 0 }
    changed = true
  } catch {
    // offline/rate-limited build: keep whatever the snapshot already has
  }
}

if (changed) {
  writeFileSync(OUT, JSON.stringify(next, null, 2) + '\n')
  console.log('[github-stats] snapshot updated:', Object.keys(next).join(', '))
} else {
  console.log('[github-stats] no fresh data; keeping committed snapshot')
}
