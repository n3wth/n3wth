import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { resolve, join, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { checkPublicDocument } from './check-built-metadata.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

export function articleUrls(xml) {
  const dom = new JSDOM(xml, { contentType: 'application/xml' })
  try {
    return [...new Set([...dom.window.document.querySelectorAll('url > loc')]
      .map(node => node.textContent.trim())
      .filter(value => {
        const url = new URL(value)
        return url.origin === 'https://n3wth.com' && url.pathname.startsWith('/thinking/')
      }))].sort()
  } finally { dom.window.close() }
}

async function localTarget(dist, pathname) {
  const target = resolve(dist, `.${decodeURIComponent(pathname)}`)
  const rel = relative(dist, target)
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('Path leaves build directory')
  for (const candidate of [target, join(target, 'index.html'), `${target}.html`]) {
    try { if ((await stat(candidate)).isFile()) return candidate } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error
    }
  }
  return null
}

export async function inspectArticle(html, url, { dist, readability } = {}) {
  // No runScripts/resources options: article JavaScript and remote resources never run.
  const dom = new JSDOM(html, { url })
  try {
    const document = dom.window.document
    const issues = []
    const add = (code, detail) => issues.push({ code, detail })
    try { checkPublicDocument(document, url) } catch (error) { add('metadata', error.message) }
    const canonical = document.querySelector('link[rel="canonical"]')?.href
    if (canonical && canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) add('canonical-mismatch', canonical)
    const main = document.querySelector('main')?.cloneNode(true)
    if (!main) {
      add('missing-main', 'No main element; body/navigation were not scored as article text.')
      return { url, title: document.title, wordCount: 0, issues, readability: null, keyphraseSeo: 'skipped: no explicit target keyphrase' }
    }
    main.querySelectorAll('nav, footer, script, style, template, noscript, [hidden], [aria-hidden="true"]').forEach(node => node.remove())
    const headings = [...main.querySelectorAll('h1')]
    if (headings.length !== 1) add('h1-count', `Expected one article H1; found ${headings.length}.`)
    const images = [...main.querySelectorAll('img')]
    images.filter(image => !image.hasAttribute('alt')).forEach(image => add('missing-alt', image.getAttribute('src') ?? '(no src)'))
    const uncheckedFragments = []
    const checkedLinks = new Set()
    for (const anchor of main.querySelectorAll('a[href]')) {
      const href = anchor.getAttribute('href')
      let destination
      try { destination = new URL(href, url) } catch { add('invalid-link', href); continue }
      if (destination.origin !== new URL(url).origin) continue
      if (destination.hash) uncheckedFragments.push(destination.href)
      if (!dist || checkedLinks.has(destination.pathname)) continue
      checkedLinks.add(destination.pathname)
      if (!await localTarget(dist, destination.pathname)) add('missing-local-link-target', destination.pathname)
    }
    const textCopy = main.cloneNode(true)
    textCopy.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, div, section, pre, br, td, th').forEach(node => node.append(' '))
    const text = textCopy.textContent.replace(/\s+/g, ' ').trim()
    const wordCount = text ? text.split(/\s+/).length : 0
    return {
      url, title: document.title, wordCount, issues,
      readability: readability ? await readability(main.innerHTML, document.title) : null,
      keyphraseSeo: 'skipped: no explicit target keyphrase',
      links: { checkedLocalPaths: checkedLinks.size, uncheckedFragments: [...new Set(uncheckedFragments)] },
    }
  } finally { dom.window.close() }
}

export async function auditArticles({ dist = join(root, 'apps/portfolio/dist'), output = join(root, '.release/article-audit'), readability } = {}) {
  dist = resolve(dist)
  const urls = articleUrls(await readFile(join(dist, 'sitemap.xml'), 'utf8'))
  if (!urls.length) throw new Error('Sitemap contains no n3wth.com /thinking/ articles')
  const results = []
  for (const url of urls) {
    try {
      const file = await localTarget(dist, new URL(url).pathname)
      if (!file) throw new Error('Missing prerendered article HTML')
      results.push(await inspectArticle(await readFile(file, 'utf8'), url, { dist, readability }))
    } catch (error) { results.push({ url, error: error.message }) }
  }
  const report = {
    scope: 'Prerendered https://n3wth.com/thinking/* URLs in the local build sitemap',
    coverage: { expected: urls.length, audited: results.filter(result => !result.error).length, errors: results.filter(result => result.error).length },
    limitations: ['Static HTML only; dynamic widgets are not evaluated.', 'Keyphrase SEO is not scored without explicit target keyphrases.', 'Internal links check local file existence only. Redirects, API routes, queries and fragment validity require live verification.', 'External links and ranking/search-volume data are not checked.', 'Short articles have no minimum word-count requirement. Readability suggestions require editorial judgment.'],
    articles: results,
  }
  await mkdir(output, { recursive: true })
  await writeFile(join(output, 'articles.json'), `${JSON.stringify(report, null, 2)}\n`)
  const counts = new Map()
  for (const article of results) for (const issue of article.issues ?? []) counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1)
  const lines = ['# Article audit', '', `Coverage: ${report.coverage.audited}/${urls.length} articles audited; ${report.coverage.errors} errors.`, '', '## Structural findings', '', ...[...counts].sort().map(([code, count]) => `- ${code}: ${count}`)]
  if (!counts.size) lines.push('No structural findings.')
  if (counts.size) {
    const cell = value => String(value).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ')
    lines.push('', '| Article | Finding | Detail |', '| --- | --- | --- |')
    for (const article of results) for (const issue of article.issues ?? []) lines.push(`| [${cell(article.title || article.url)}](${article.url}) | ${issue.code} | ${cell(issue.detail)} |`)
  }
  lines.push('', '## Limits', '', ...report.limitations.map(item => `- ${item}`), '', 'Full per-article findings and Yoast readability results: `articles.json`.', '')
  if (report.coverage.errors) lines.push('## Errors', '', ...results.filter(result => result.error).map(result => `- ${result.url}: ${result.error}`), '')
  await writeFile(join(output, 'summary.md'), lines.join('\n'))
  return report
}

export async function createReadabilityAnalyzer() {
  const { default: yoast } = await import('yoastseo')
  const { default: researcherModule } = await import('yoastseo/build/languageProcessing/languages/en/Researcher.js')
  const Researcher = researcherModule.default ?? researcherModule
  const { Paper, ContentAssessor } = yoast
  return html => {
    const paper = new Paper(html, { locale: 'en_US' })
    const researcher = new Researcher(paper)
    const assessor = new ContentAssessor(researcher)
    assessor.assess(paper)
    return { score: assessor.calculateOverallScore(), assessments: assessor.getValidResults().map(result => ({ score: result.getScore(), text: result.getText() })) }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    const options = {}
    for (let i = 0; i < args.length; i += 2) {
      if (!['--dist', '--output'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Usage: node scripts/article-audit.mjs [--dist directory] [--output directory]')
      options[args[i].slice(2)] = resolve(args[i + 1])
    }
    const report = await auditArticles({ ...options, readability: await createReadabilityAnalyzer() })
    console.log(`Article audit: ${report.coverage.audited}/${report.coverage.expected} audited, ${report.coverage.errors} errors. Reports: ${options.output ?? join(root, '.release/article-audit')}`)
    if (report.coverage.errors) process.exitCode = 1
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
