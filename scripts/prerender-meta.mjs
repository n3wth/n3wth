/**
 * Per-route static HTML for crawlers and link unfurlers (npm postbuild).
 *
 * The SPA served the same index.html — same title, description, OG tags,
 * and home-page fallback content — for every route, so search engines and
 * social unfurlers saw one page instead of five. This emits
 * dist/<route>/index.html with route-specific head tags and a static
 * content summary; Vercel serves real files before its SPA rewrite, so
 * each route now has its own crawlable document. The app itself is
 * unchanged — the same bundle hydrates on top.
 *
 * It also emits the discovery surface derived from the same route list:
 * dist/sitemap.xml (with lastmod), dist/feed.xml (Atom, thinking pieces),
 * dist/llms.txt (+ llms-full.txt), and dist/404.html.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const dist = join(here, '../dist')
const ORIGIN = 'https://n3wth.com'

const routes = [
  {
    path: 'work',
    title: 'Work — Oliver Newth',
    description:
      'Twelve years of AI in production across Google, Covariant, Meta, and Microsoft — and five products designed by hand, shipped by an agent team.',
    ogImage: '/og/work.png',
    body: `
      <h1>Work — Oliver Newth</h1>
      <section>
        <h2>Twelve years of AI, in production</h2>
        <p>From Azure Cognitive Services in 2014 to DeepMind model platforms today, by way of Meta and Covariant.</p>
        <ul>
          <li>Google (2025–): AI Product Lead — platforms that put Google DeepMind models into products.</li>
          <li>Covariant (2022–24): Staff Product Manager — computer vision from research demos to warehouse floors running 24/7, through Amazon's acquisition of the team.</li>
          <li>Meta (2017–22): Product Manager — video calling across Instagram and Portal; core growth and integrity. Build Social Value Award, 2020.</li>
          <li>Microsoft (2014–17): Product Manager, Azure — Azure Cognitive Services, 100M+ API requests a day.</li>
        </ul>
        <p>MEng in High Performance Structures, MIT (Kennedy Scholar); Civil Engineering, First Class, Warwick.</p>
      </section>
      <section>
        <h2>Designed by hand, shipped by agents</h2>
        <p>Live products, designed by Oliver and kept shipping by a standing team of autonomous agents:</p>
        <ul>
          <li><a href="https://hop.flights" rel="noopener">hop.flights</a> — points-vs-cash flight optimizer.</li>
          <li><a href="https://r3.newth.ai" rel="noopener">r3</a> — persistent memory for AI apps: vector search and knowledge graphs, no config.</li>
          <li><a href="https://kit.n3wth.com" rel="noopener">kit</a> — 49 components with AI context packs.</li>
          <li><a href="https://theywontshutup.com" rel="noopener">theywontshutup.com</a> — AI voice hotline.</li>
          <li><a href="https://garden.n3wth.com" rel="noopener">garden</a> — a digital garden of working notes.</li>
        </ul>
      </section>`,
  },
  {
    path: 'art',
    title: 'After dark — Oliver Newth',
    description:
      'Large-scale light installations for Burning Man and San Francisco memorials — THEM, Pink Triangle, and Circle of Light.',
    ogImage: '/og/art.png',
    body: `
      <h1>After dark — light installations by Oliver Newth</h1>
      <p>I build things that glow: large-scale light art in the desert and for San Francisco memorials.</p>
      <ul>
        <li>THEM — lighting on the 30-foot Burning Man sculpture by artist Simon Malvaez, Black Rock Desert.</li>
        <li>Pink Triangle — LED crew on Patrick Carney's illuminated Pride memorial, Twin Peaks, San Francisco.</li>
        <li>Circle of Light — World AIDS Day memorial of light, Golden Gate Park, San Francisco (2021).</li>
      </ul>`,
  },
  {
    path: 'library',
    title: 'Library — Oliver Newth',
    description:
      'Installable pieces from across the n3wth properties: the essay kit behind the Thinking pieces, the @n3wth/ui component library, the digital garden, and agent skills.',
    ogImage: '/og-image.png',
    body: `
      <h1>Library — Oliver Newth</h1>
      <p>The components and systems behind n3wth.com and the sites next to it, with the install instructions that work today.</p>
      <section>
        <h2>The essay kit</h2>
        <p>Eight layout primitives that lay out every Thinking piece on this site: Beat, MarginNote, ToggleCompare, FlowDiagram, AssembleField, LiveConstellationDemo, LiveMaterialDemo, and ThinkingIndex.</p>
      </section>
      <section>
        <h2>@n3wth/ui</h2>
        <p>An atomic React design system published to npm as @n3wth/ui: 36 components across 20 atoms, 12 molecules and 4 organisms, plus 11 hooks. Install it with <code>npm install @n3wth/ui</code>. Full documentation at <a href="https://ui.n3wth.com" rel="noopener">ui.n3wth.com</a>.</p>
      </section>
      <section>
        <h2>The garden</h2>
        <p>Working notes at <a href="https://garden.n3wth.com" rel="noopener">garden.n3wth.com</a>, sorted by growth stage (seedling, budding, evergreen) and gathered into groves.</p>
      </section>
      <section>
        <h2>Agent skills</h2>
        <p>Skills for coding assistants at <a href="https://skills.n3wth.com" rel="noopener">skills.n3wth.com</a> covering development, documents, creative work, productivity and business. They run locally and work offline.</p>
      </section>`,
  },
  {
    path: 'contact',
    title: 'Contact — Oliver Newth',
    description:
      "Get in touch with Oliver Newth — product, AI safety, or LED art. Coffee if you're in San Francisco.",
    ogImage: '/og/contact.png',
    body: `
      <h1>Contact Oliver Newth</h1>
      <p>Happy to talk about product work, AI safety, or LED art. Coffee if you're in San Francisco. Email: oliver@newth.ai</p>`,
  },
  {
    path: 'support',
    title: 'Support — Oliver Newth',
    description:
      'Support for n3wth projects — n3wth.com, hop.flights, and theywontshutup.com. Email support@n3wth.com.',
    ogImage: '/og-image.png',
    body: `
      <h1>Support</h1>
      <p>One inbox covers every n3wth project: <a href="mailto:support@n3wth.com">support@n3wth.com</a>.</p>
      <ul>
        <li><a href="https://n3wth.com">n3wth.com</a> — portfolio, writing, and experiments. support@n3wth.com</li>
        <li><a href="https://hop.flights" rel="noopener">hop.flights</a> — flight search and booking tools. support@hop.flights</li>
        <li><a href="https://theywontshutup.com" rel="noopener">theywontshutup.com</a> — AI voice hotline. support@n3wth.com</li>
      </ul>`,
  },
  /* Auth utility routes: prerendered so their noindex is in the static
     head (crawlers may never run the client-side usePageMeta noindex). */
  {
    path: 'login',
    title: 'Signing in — Oliver Newth',
    description: 'Redirecting to sign-in.',
    ogImage: '/og-image.png',
    noindex: true,
    body: `
      <h1>Redirecting to sign-in</h1>`,
  },
  {
    path: 'logout',
    title: 'Signed out — Oliver Newth',
    description: 'You have been signed out.',
    ogImage: '/og-image.png',
    noindex: true,
    body: `
      <h1>You're signed out</h1>
      <p><a href="/">Go home</a> · <a href="/support">Get support</a></p>`,
  },
  {
    path: 'error',
    title: 'Something went wrong — Oliver Newth',
    description: 'An error occurred.',
    ogImage: '/og-image.png',
    noindex: true,
    body: `
      <h1>Something went wrong</h1>
      <p>Trying again usually clears it. If it keeps happening, <a href="/support">get support</a>.</p>`,
  },
]

/* Per-piece pages: parse the literal meta objects out of the registry
   source so every /thinking/:slug ships its own title, description,
   canonical, OG tags, and Article structured data. The metas are
   uniform string literals; a parse miss throws here instead of silently
   serving the homepage head on 21 routes. */
const registrySrc = readFileSync(
  join(here, '../src/components/thinking/registry.tsx'),
  'utf8'
)
const metaRe =
  /meta:\s*\{\s*id:\s*'([^']+)',\s*title:\s*(['"])((?:(?!\2)[\s\S])*?)\2,\s*dek:\s*(['"])((?:(?!\4)[\s\S])*?)\4,\s*date:\s*'([^']+)'/g
const pieceMetas = []
let pieceMatch
while ((pieceMatch = metaRe.exec(registrySrc))) {
  pieceMetas.push({
    id: pieceMatch[1],
    title: pieceMatch[3],
    dek: pieceMatch[5],
    date: pieceMatch[6],
  })
}
const registeredCount = (registrySrc.match(/meta:\s*\{/g) ?? []).length
if (pieceMetas.length === 0 || pieceMetas.length !== registeredCount) {
  throw new Error(
    `prerender-meta: parsed ${pieceMetas.length} of ${registeredCount} thinking piece metas`
  )
}

/* Optional per-piece prose summaries (src/data/piece-summaries.json).
   When present they give no-JS crawlers — including the AI ones, none of
   which execute JS — real text to quote instead of a one-line dek. */
const summariesPath = join(here, '../src/data/piece-summaries.json')
const summaries = existsSync(summariesPath)
  ? JSON.parse(readFileSync(summariesPath, 'utf8'))
  : {}

const escText = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* The /thinking hub links every piece: without these anchors the piece
   pages are orphans in the no-JS crawl graph. */
routes.push({
  path: 'thinking',
  title: 'Thinking — Oliver Newth',
  description:
    'Positions on production AI and agents as an org design problem, plus interactive walk-throughs of real AI safety trade-offs.',
  ogImage: '/og/thinking.png',
  body: `
      <h1>Thinking — Oliver Newth</h1>
      <section>
        <h2>What I believe about production AI</h2>
        <p>Positions from shipping AI at scale and running an agent team in production, plus interactive walk-throughs of real AI safety dilemmas.</p>
        <ul>
${pieceMetas
  .map(
    (p) =>
      `          <li><a href="/thinking/${p.id}">${escText(p.title)}</a> (${p.date}) — ${escText(p.dek)}</li>`
  )
  .join('\n')}
        </ul>
      </section>`,
})

for (const p of pieceMetas) {
  const summary = summaries[p.id]
  routes.push({
    path: `thinking/${p.id}`,
    title: `${p.title} — Oliver Newth`,
    description: p.dek.length > 160 ? `${p.dek.slice(0, 157).trimEnd()}…` : p.dek,
    ogImage: '/og/thinking.png',
    article: { published: p.date },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: p.title,
      description: p.dek,
      ...(summary ? { abstract: summary } : {}),
      datePublished: p.date,
      dateModified: p.date,
      image: `${ORIGIN}/og/thinking.png`,
      mainEntityOfPage: `${ORIGIN}/thinking/${p.id}`,
      author: { '@id': `${ORIGIN}/#person` },
      url: `${ORIGIN}/thinking/${p.id}`,
    },
    body: `
      <h1>${escText(p.title)}</h1>
      <p>${escText(p.dek)}</p>
${
  summary
    ? summary
        .split(/\n\n+/)
        .map((para) => `      <p>${escText(para)}</p>`)
        .join('\n')
    : ''
}
      <p><a href="/thinking">All Thinking pieces</a></p>`,
  })
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const template = readFileSync(join(dist, 'index.html'), 'utf8')

const renderRoute = (r, outPath) => {
  let html = template
  const url = `${ORIGIN}/${r.path}`
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${r.title}</title>`)
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${esc(r.description)}$2`
  )
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
  html = html.replace(
    /(<meta property="og:description" content=")[^"]*(")/,
    `$1${esc(r.description)}$2`
  )
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
  html = html.replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    `$1${ORIGIN}${r.ogImage}$2`
  )
  html = html.replace(
    /(<meta property="og:image:alt" content=")[^"]*(")/,
    `$1${esc(r.title)}$2`
  )
  html = html.replace(
    /(<meta name="twitter:title" content=")[^"]*(")/,
    `$1${esc(r.title)}$2`
  )
  html = html.replace(
    /(<meta name="twitter:description" content=")[^"]*(")/,
    `$1${esc(r.description)}$2`
  )
  html = html.replace(
    /(<meta name="twitter:image" content=")[^"]*(")/,
    `$1${ORIGIN}${r.ogImage}$2`
  )
  html = html.replace(
    /(<meta name="twitter:image:alt" content=")[^"]*(")/,
    `$1${esc(r.title)}$2`
  )
  if (r.article) {
    html = html.replace(
      /(<meta property="og:type" content=")[^"]*(")/,
      `$1article$2`
    )
    html = html.replace(
      '</head>',
      `  <meta property="article:published_time" content="${r.article.published}" />\n  </head>`
    )
  }
  if (r.noindex) {
    html = html.replace(
      '</head>',
      '  <meta name="robots" content="noindex, nofollow" />\n  </head>'
    )
  }
  if (r.jsonLd) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">${JSON.stringify(r.jsonLd)}</script>\n  </head>`
    )
  }
  html = html.replace(
    /<main id="main" class="seo-fallback">[\s\S]*?<\/main>/,
    `<main id="main" class="seo-fallback">${r.body}\n      </main>`
  )
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
}

for (const r of routes) {
  renderRoute(r, join(dist, r.path, 'index.html'))
  console.log(`[prerender-meta] dist/${r.path}/index.html`)
}

/* dist/404.html — Vercel serves it with a 404 status for unmatched paths
   once the SPA catch-all rewrite is gone, ending the soft-404s where every
   unknown URL returned the homepage as a 200. */
renderRoute(
  {
    path: '404',
    title: 'Not found — Oliver Newth',
    description: 'This page does not exist.',
    ogImage: '/og-image.png',
    noindex: true,
    body: `
      <h1>This page doesn't exist</h1>
      <p>The link may be old, or the address mistyped (404). <a href="/">Go home</a>.</p>`,
  },
  join(dist, '404.html')
)
console.log('[prerender-meta] dist/404.html')

/* dist/sitemap.xml — generated from the same route list so it can't
   drift when a piece is added. lastmod only; Google ignores
   changefreq/priority. */
const latestPieceDate = pieceMetas.map((p) => p.date).sort().at(-1)
const buildDate = new Date().toISOString().slice(0, 10)
const sitemapEntries = [
  { loc: `${ORIGIN}/`, lastmod: buildDate },
  ...routes
    .filter((r) => !r.noindex)
    .map((r) => ({
      loc: `${ORIGIN}/${r.path}`,
      lastmod: r.article?.published ?? buildDate,
    })),
]
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries
    .map((e) => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
)
console.log(`[prerender-meta] dist/sitemap.xml (${sitemapEntries.length} urls)`)

/* dist/feed.xml — Atom feed of the thinking pieces: a freshness signal
   and a discovery channel the sitemap alone doesn't provide. */
const feedEntries = [...pieceMetas]
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map(
    (p) => `  <entry>
    <title>${escText(p.title)}</title>
    <link href="${ORIGIN}/thinking/${p.id}" />
    <id>${ORIGIN}/thinking/${p.id}</id>
    <updated>${p.date}T00:00:00Z</updated>
    <summary>${escText(summaries[p.id] ?? p.dek)}</summary>
  </entry>`
  )
writeFileSync(
  join(dist, 'feed.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Thinking — Oliver Newth</title>
  <link href="${ORIGIN}/thinking" />
  <link rel="self" href="${ORIGIN}/feed.xml" />
  <id>${ORIGIN}/feed.xml</id>
  <updated>${latestPieceDate}T00:00:00Z</updated>
  <author><name>Oliver Newth</name></author>
${feedEntries.join('\n')}
</feed>\n`
)
console.log(`[prerender-meta] dist/feed.xml (${feedEntries.length} entries)`)

/* dist/llms.txt — the hand-written base plus a generated Thinking section,
   and dist/llms-full.txt with the piece summaries, so AI assistants can
   enumerate and quote the writing, not just the six top-level pages. */
const llmsBase = readFileSync(join(here, '../public/llms.txt'), 'utf8').trimEnd()
const thinkingSection = `\n\n## Thinking\n\n${pieceMetas
  .map((p) => `- [${p.title}](${ORIGIN}/thinking/${p.id}): ${p.dek}`)
  .join('\n')}\n`
writeFileSync(join(dist, 'llms.txt'), llmsBase + thinkingSection)
console.log('[prerender-meta] dist/llms.txt')

if (Object.keys(summaries).length > 0) {
  const full = pieceMetas
    .filter((p) => summaries[p.id])
    .map((p) => `# ${p.title} (${p.date})\n${ORIGIN}/thinking/${p.id}\n\n${summaries[p.id]}`)
    .join('\n\n---\n\n')
  writeFileSync(join(dist, 'llms-full.txt'), `${llmsBase}\n\n${full}\n`)
  console.log('[prerender-meta] dist/llms-full.txt')
}
