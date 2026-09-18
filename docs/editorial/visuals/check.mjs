import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '../../..')
const content = path.join(root, 'apps/garden/content')
const assets = path.join(root, 'apps/garden/public')
const records = (await Promise.all((await fs.readdir(directory))
  .filter(name => name.endsWith('.json'))
  .map(async name => JSON.parse(await fs.readFile(path.join(directory, name), 'utf8'))))).flat()
const failures = []
const files = new Set()
const usedAssets = new Set()
const urls = new Set()
const pageChecks = []
const require = (condition, message) => { if (!condition) failures.push(message) }
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#x26;', '&')

require(records.length >= 100, `Expected at least 100 enhanced pages; found ${records.length}`)
for (const record of records) {
  const label = record.file || '(missing file)'
  try {
    require(record.file && !files.has(record.file), `${label}: missing or duplicate page`)
    files.add(record.file)
    require(record.asset && !usedAssets.has(record.asset), `${label}: missing or duplicate asset`)
    usedAssets.add(record.asset)
    require(record.file?.endsWith('.md') && !record.file.includes('..'), `${label}: invalid content path`)
    require(record.asset?.startsWith('/figures/') && !record.asset.includes('..'), `${label}: invalid asset path`)
    if (!record.file || !record.asset || record.file.includes('..') || record.asset.includes('..')) continue
    const markdown = await fs.readFile(path.join(content, record.file), 'utf8')
    const figure = [...markdown.matchAll(/<figure\b[^>]*class="research-figure"[^>]*>[\s\S]*?<\/figure>/g)]
      .map(match => match[0]).find(block => block.includes(`src="${record.asset}"`))
    require(Boolean(figure), `${label}: matching article figure missing`)
    if (!figure) continue
    const img = figure.match(/<img\b[^>]*>/)?.[0] || ''
    const caption = figure.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] || ''
    require((attribute(img, 'alt') || '').length >= 30, `${label}: descriptive alt text missing`)
    require(Number(attribute(img, 'width')) > 0 && Number(attribute(img, 'height')) > 0, `${label}: intrinsic dimensions missing`)
    require(attribute(img, 'loading') === 'lazy', `${label}: lazy loading missing`)
    require(figure.includes(`href="${record.asset}"`), `${label}: full-size link missing`)
    require(caption.length >= 60 && /href="https:\/\//.test(caption), `${label}: sourced caption missing`)
    require(record.caption && record.rationale && record.kind, `${label}: editorial record incomplete`)
    require(record.sources?.length > 0, `${label}: source evidence missing`)
    for (const source of record.sources || []) {
      const url = new URL(source.url)
      require(url.protocol === 'https:', `${label}: source must use HTTPS`)
      require(source.title && source.publisher && source.evidence && source.accessed, `${label}: source record incomplete`)
      require(decode(caption).includes(source.url), `${label}: source absent from caption: ${source.url}`)
      urls.add(source.url)
    }
    require(record.rights?.type && record.rights.attribution, `${label}: rights record missing`)
    if (record.rights?.type !== 'original') {
      require(record.rights?.licenseUrl && decode(caption).includes(record.rights.licenseUrl), `${label}: visible reuse-license link missing`)
      if (record.rights?.licenseUrl) urls.add(record.rights.licenseUrl)
    }
    const assetPath = path.join(assets, record.asset)
    const buffer = await fs.readFile(assetPath)
    const metadata = await sharp(buffer).metadata()
    require(metadata.width > 0 && metadata.height > 0, `${label}: unreadable image`)
    const ratio = Number(attribute(img, 'width')) / Number(attribute(img, 'height'))
    require(Math.abs(ratio - metadata.width / metadata.height) < 0.01, `${label}: image aspect ratio is incorrect`)
    if (record.asset.endsWith('.svg')) {
      const svg = buffer.toString('utf8')
      require(!/<(?:script|foreignObject|image)\b|\bon\w+\s*=|(?:href|url)\s*[=(]\s*["']?https?:/i.test(svg), `${label}: unsafe or externally dependent SVG`)
      require(/<title[\s>]/.test(svg) && /<desc[\s>]/.test(svg), `${label}: SVG title/description missing`)
      require(!/font-weight\s*[:=]\s*["']?(?:[7-9]00|bold)/i.test(svg), `${label}: figure exceeds the site's semibold weight limit`)
      await sharp(buffer).resize({ width: 960 }).png().toBuffer()
    }
    pageChecks.push(record)
  } catch (error) {
    failures.push(`${label}: ${error.message}`)
  }
}

const siteIndex = process.argv.indexOf('--site')
if (siteIndex !== -1) {
  const origin = process.argv[siteIndex + 1]
  if (!origin) throw new Error('--site requires an origin')
  const resourceSelections = JSON.parse(await fs.readFile(path.join(root, 'apps/garden/src/lib/resource-preview-data.json'), 'utf8'))
  const queue = [...pageChecks]
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (queue.length) {
      const record = queue.shift()
      const slug = record.file.replace(/\.md$/, '').split('/')
        .map(part => part.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).join('/')
      try {
        const response = await fetch(new URL(slug, origin.endsWith('/') ? origin : origin + '/'), { signal: AbortSignal.timeout(25_000) })
        const html = await response.text()
        const figure = html.match(/<figure\b[^>]*class="research-figure"[^>]*>[\s\S]*?<\/figure>/)?.[0] || ''
        require(response.ok && figure.includes(record.asset) && /<figcaption/.test(figure), `${slug}: deployed figure missing`)
        for (const source of record.sources) require(decode(figure).includes(source.url), `${slug}: deployed source missing: ${source.url}`)
        const resources = html.match(/<section\b[^>]*class="resource-previews"[^>]*>[\s\S]*?<\/section>/)?.[0] || ''
        require(resources.includes('Further reading'), `${slug}: resource previews missing`)
        for (const choice of resourceSelections[record.file] || []) {
          const source = record.sources[choice.source]
          require(source && decode(resources).includes(source.url), `${slug}: selected resource preview missing`)
        }
        const imageResponse = await fetch(new URL(record.asset, origin), { signal: AbortSignal.timeout(25_000) })
        require(imageResponse.ok && imageResponse.headers.get('content-type')?.startsWith('image/'), `${slug}: deployed image unavailable`)
        if (imageResponse.ok) await sharp(Buffer.from(await imageResponse.arrayBuffer())).metadata()
      } catch (error) {
        failures.push(`${slug}: live check failed: ${error.message}`)
      }
    }
  }))
  console.log(`Checked ${pageChecks.length} rendered pages and image responses at ${origin}`)
}

const linkIndex = process.argv.indexOf('--links')
if (linkIndex !== -1) {
  const reportPath = process.argv[linkIndex + 1]
  if (!reportPath) throw new Error('--links requires a report path')
  const queue = [...urls]
  const checks = []
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (queue.length) {
      const url = queue.shift()
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(25_000), headers: { 'User-Agent': 'n3wth-editorial-source-check/1.0' } })
        const type = response.headers.get('content-type') || ''
        const body = type.includes('text/html') ? (await response.text()).slice(0, 150_000) : ''
        const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
        const softFailure = /^(?:404|page not found|access denied|just a moment|attention required|robot check)/i.test(title)
        const ok = response.ok && !softFailure
        checks.push({ url, finalUrl: response.url, status: response.status, type, title, ok })
        require(ok, `Source transport check failed (${response.status}): ${url}`)
      } catch (error) {
        checks.push({ url, ok: false, error: error.message })
        failures.push(`Source transport check failed: ${url}: ${error.message}`)
      }
    }
  }))
  await fs.writeFile(reportPath, JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2) + '\n')
}

console.log(`${records.length} records; ${files.size} pages; ${usedAssets.size} assets; ${urls.size} distinct source/license URLs`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log('Figure evidence records, page markup and image assets passed.')
}
