#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeHistory } from './content-history.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8' }).trim()
const prefix = `${relative(repo, join(root, 'content')).replaceAll('\\', '/')}/`
const out = join(root, 'src/data/content-history.json')
const baseline = JSON.parse(readFileSync(out, 'utf8'))
const log = execFileSync('git', ['log', '--format=%at', '--name-status', '--no-renames', '--', prefix], {
  cwd: repo, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8',
})
const history = mergeHistory(log, prefix, baseline)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(history) + '\n')
console.log(`Wrote ${Object.keys(history).length} note histories to src/data/content-history.json`)
