// Run after npm ci at the repository root.
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from '@mdx-js/mdx'
import matter from 'gray-matter'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/portfolio/src/content/docs/docs')

async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const groups = await Promise.all(entries.map(entry => {
    const path = resolve(dir, entry.name)
    return entry.isDirectory() ? markdownFiles(path) : /\.mdx?$/.test(entry.name) ? [path] : []
  }))
  return groups.flat()
}

const files = await markdownFiles(root)
assert(files.length > 0, 'Documentation must contain pages')
const slugs = new Set(files.map(file => relative(root, file).split(sep).join('/').replace(/\.mdx?$/, '')))

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const slug = relative(root, file).split(sep).join('/').replace(/\.mdx?$/, '')
  const { data, content } = matter(source)
  assert(typeof data.title === 'string' && data.title.trim(), `${slug}: missing title`)
  assert(typeof data.description === 'string' && data.description.trim(), `${slug}: missing description`)
  assert(typeof data.sidebar?.label === 'string', `${slug}: missing sidebar label`)
  await compile(content, { development: false })
  // Do not interpret installation snippets as links in the documentation itself.
  const prose = content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
  for (const match of prose.matchAll(/\]\((\/[^\s)]+)\)|href=["'](\/[^"']+)["']/g)) {
    const href = match[1] || match[2]
    if (!href.startsWith('/docs')) continue
    const target = decodeURIComponent(href.split(/[?#]/)[0]).replace(/^\/docs\/?/, '').replace(/\/$/, '') || 'index'
    assert(slugs.has(target), `${slug}: broken local page link ${href}`)
  }
  assert(!/ctx7sk-[a-z\d-]+/i.test(source), `${slug}: possible API key`)
}

console.log(`Validated ${files.length} Starlight MDX pages, metadata, and local page links`)
