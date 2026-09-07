/**
 * Build-time snapshot of the most recently tended garden notes
 * (garden.n3wth.com/feed.xml), for the /thinking "Tended recently"
 * section. Same contract as fetch-github-stats.mjs: never fails the
 * build, never invents content — on any error the committed snapshot
 * is left untouched.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/data/garden-notes.json')
const FEED = 'https://garden.n3wth.com/feed.xml'
const MAX = 5

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : ''
}

const decode = (s) =>
  s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")

try {
  const res = await fetch(FEED, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`feed ${res.status}`)
  const xml = await res.text()
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, body]) => ({
      title: decode(tag(body, 'title')),
      href: tag(body, 'link'),
      description: decode(tag(body, 'description')),
      date: tag(body, 'pubDate'),
    }))
    // the garden's index page ships in the feed; it isn't a note
    .filter((n) => n.title && n.href && !['Home', 'About'].includes(n.title))
    .slice(0, MAX)
  if (items.length === 0) throw new Error('feed parsed to zero notes')
  writeFileSync(OUT, JSON.stringify(items, null, 2) + '\n')
  console.log(`[garden-notes] snapshot updated: ${items.length} notes`)
} catch (err) {
  try {
    readFileSync(OUT, 'utf8')
    console.warn(`[garden-notes] fetch failed (${err.message}); keeping committed snapshot`)
  } catch {
    writeFileSync(OUT, '[]\n')
    console.warn(`[garden-notes] fetch failed (${err.message}); wrote empty snapshot`)
  }
}
