import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { articleUrls, inspectArticle, auditArticles, createReadabilityAnalyzer } from './article-audit.mjs'

const url = 'https://n3wth.com/thinking/test'
const html = body => `<!doctype html><html><head><title>Test article</title><link rel="canonical" href="${url}"><meta name="description" content="Test description">${['og:title', 'og:description', 'og:type', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].map(name => `<meta property="${name}" content="Test">`).join('')}<meta property="og:url" content="${url}"></head><body>${body}</body></html>`
const sitemap = urls => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(value => `<url><loc>${value}</loc></url>`).join('')}</urlset>`

test('sitemap scopes, sorts and deduplicates published thinking URLs', () => {
  assert.deepEqual(articleUrls(sitemap([url, url, 'https://n3wth.com/thinking', 'https://other.com/thinking/test', 'https://n3wth.com/work'])), [url])
})

test('article scope excludes navigation, hidden text and executable scripts; short pages need no padding', async () => {
  let assessed
  const result = await inspectArticle(html('<nav>Outside nav</nav><main><nav>Inner nav</nav><h1>Title</h1><p>Two words.</p><p hidden>Hidden</p><script>throw new Error("executed")</script></main>'), url, {
    readability: content => { assessed = content; return { score: 90 } },
  })
  assert.equal(result.wordCount, 3)
  assert.deepEqual(result.issues, [])
  assert.equal(result.readability.score, 90)
  assert.doesNotMatch(assessed, /nav|Hidden|script|executed/)
  assert.match(result.keyphraseSeo, /skipped/)
})

test('missing main is reported instead of analyzing the whole page', async () => {
  const result = await inspectArticle(html('<nav>Lots of unrelated content</nav>'), url, { readability: () => assert.fail('Must not score navigation') })
  assert.equal(result.readability, null)
  assert.ok(result.issues.some(issue => issue.code === 'missing-main'))
})

test('reuses metadata validation and catches H1 and missing alt while allowing decorative alt', async () => {
  const result = await inspectArticle('<main><img src="missing.png"><img src="decorative.png" alt=""></main>', url)
  assert.deepEqual(result.issues.map(issue => issue.code), ['metadata', 'h1-count', 'missing-alt'])
})

test('coverage retains missing pages; local links checked without fetching or falsely validating fragments', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'article-audit-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const dist = join(directory, 'dist')
  const output = join(directory, 'reports')
  await mkdir(join(dist, 'thinking/test'), { recursive: true })
  await writeFile(join(dist, 'sitemap.xml'), sitemap([url, 'https://n3wth.com/thinking/missing']))
  await writeFile(join(dist, 'thinking/test/index.html'), html('<main><h1>Title</h1><p>Words.</p><a href="#not-checked">Fragment</a><a href="/missing">Missing</a><a href="https://example.com">External</a></main>'))
  const report = await auditArticles({ dist, output })
  assert.deepEqual(report.coverage, { expected: 2, audited: 1, errors: 1 })
  const article = report.articles.find(item => item.url === url)
  assert.deepEqual(article.issues, [{ code: 'missing-local-link-target', detail: '/missing' }])
  assert.equal(article.links.checkedLocalPaths, 2)
  assert.deepEqual(article.links.uncheckedFragments, [`${url}#not-checked`])
  assert.deepEqual(JSON.parse(await readFile(join(output, 'articles.json'), 'utf8')), report)
  assert.match(await readFile(join(output, 'summary.md'), 'utf8'), /1\/2 articles audited; 1 errors/)
})

test('actual Yoast English engine produces readability assessments', async () => {
  const analyze = await createReadabilityAnalyzer()
  const result = analyze('<h1>A clear title</h1><p>This sentence is short. We keep the words simple. Readers can follow the argument.</p>')
  assert.ok(Number.isFinite(result.score))
  assert.ok(result.assessments.length >= 5)
  assert.ok(result.assessments.some(item => /Sentence length/.test(item.text)))
  assert.ok(result.assessments.every(item => Number.isFinite(item.score)))
})
