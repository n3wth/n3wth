// Run after npm ci at the repository root.
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from '@mdx-js/mdx'
import matter from 'gray-matter'

const root = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(await readFile(resolve(root, 'docs.json'), 'utf8'))
const pages = new Set()

function readNavigation(value) {
  if (Array.isArray(value)) return value.forEach(readNavigation)
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if (key === 'pages') {
      for (const page of child) {
        if (typeof page !== 'string') {
          readNavigation(page)
          continue
        }
        assert(!page.startsWith('/') && !page.includes('..'), `Invalid page path: ${page}`)
        assert(!pages.has(page), `Duplicate navigation page: ${page}`)
        pages.add(page)
      }
    } else readNavigation(child)
  }
}

const privateDirectories = new Set(['editorial', 'plans', 'workspace'])

async function markdownFiles(dir, isRoot = dir === root) {
  const entries = await readdir(dir, { withFileTypes: true })
  const groups = await Promise.all(entries.map(entry => {
    if (isRoot && entry.isDirectory() && privateDirectories.has(entry.name)) return []
    const path = resolve(dir, entry.name)
    return entry.isDirectory() ? markdownFiles(path, false) : /\.mdx?$/.test(entry.name) ? [path] : []
  }))
  return groups.flat()
}

readNavigation(config.navigation)
assert(pages.size > 0, 'Navigation must contain pages')
const files = await markdownFiles(root)
const slugs = new Set(files.map(file => relative(root, file).split(sep).join('/').replace(/\.mdx?$/, '')))
for (const page of pages) assert(slugs.has(page), `Missing navigation target: ${page}`)

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const slug = relative(root, file).split(sep).join('/').replace(/\.mdx?$/, '')
  const { data, content } = matter(source)
  assert(typeof data.title === 'string' && data.title.trim(), `${slug}: missing title`)
  assert(typeof data.description === 'string' && data.description.trim(), `${slug}: missing description`)
  assert(pages.has(slug), `${slug}: page is missing from navigation`)
  await compile(content, { development: false })
  // Do not interpret installation snippets as links in the documentation itself.
  const prose = content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
  for (const match of prose.matchAll(/\]\((\/[^\s)]+)\)|href=["'](\/[^"']+)["']/g)) {
    const href = match[1] || match[2]
    if (href.startsWith('//')) continue
    const target = decodeURIComponent(href.split(/[?#]/)[0]).replace(/^\//, '').replace(/\/$/, '') || 'index'
    assert(slugs.has(target), `${slug}: broken local page link ${href}`)
  }
  assert(!/ctx7sk-[a-z\d-]+/i.test(source), `${slug}: possible API key`)
}

console.log(`Validated ${files.length} MDX pages, navigation, metadata, and local page links`)
