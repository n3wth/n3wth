import { readdirSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const reviews = readdirSync(new URL('./reviews/', import.meta.url))
  .filter(name => name.endsWith('.json'))
  .map(name => JSON.parse(readFileSync(new URL(`./reviews/${name}`, import.meta.url), 'utf8')))
const reviewed = new Set(reviews.map(review => review.contentPath))
const base = process.argv[2]
if (!base || /^0+$/.test(base)) throw new Error('A valid comparison base is required')
const added = execFileSync('git', ['diff', '--name-only', '--diff-filter=A', '-z', base, 'HEAD', '--'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
const manuscripts = added.filter(path => /^apps\/portfolio\/content\/(?!Attachments\/|Tags\/).*\.md$/.test(path) || /^apps\/portfolio\/src\/components\/thinking\/pieces\/[^/]+\.tsx$/.test(path))
const missing = manuscripts.filter(path => !reviewed.has(path))
if (missing.length) throw new Error(`New public manuscripts require a hashed editorial review: ${missing.join(', ')}`)
console.log(`Review coverage verified for ${manuscripts.length} new public manuscripts`)
