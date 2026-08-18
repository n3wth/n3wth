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
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist')
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
        <p>Five live products, designed by Oliver and kept shipping by a standing team of autonomous agents: r3 (persistent memory for AI apps), kit (49 components with AI context packs), hop.flights (points-vs-cash flight optimizer), and more.</p>
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
    path: 'thinking',
    title: 'Thinking — Oliver Newth',
    description:
      'Positions on production AI and agents as an org design problem, plus interactive walk-throughs of real AI safety trade-offs.',
    ogImage: '/og/thinking.png',
    body: `
      <h1>Thinking — Oliver Newth</h1>
      <section>
        <h2>What I believe about production AI</h2>
        <p>Three positions from shipping AI at scale and running an agent team in production, plus interactive walk-throughs of real AI safety dilemmas — each one a trade-off where every option costs real people something.</p>
      </section>`,
  },
  {
    path: 'library',
    title: 'Library — Oliver Newth',
    description:
      'Installable pieces from across the n3wth properties: the essay kit behind the Thinking pieces, the @n3wth/ui component library, a 248-note digital garden, and agent skills.',
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
        <p>An atomic React design system published to npm as @n3wth/ui: 36 components across 20 atoms, 12 molecules and 4 organisms, plus 11 hooks. Install it with <code>npm install @n3wth/ui</code>. Full documentation at ui.n3wth.com.</p>
      </section>
      <section>
        <h2>The garden</h2>
        <p>248 interconnected notes at garden.n3wth.com, sorted by growth stage (seedling, budding, evergreen) and gathered into groves. 1,056 internal links across 210 tag collections.</p>
      </section>
      <section>
        <h2>Agent skills</h2>
        <p>Skills for coding assistants at skills.n3wth.com covering development, documents, creative work, productivity and business. They run locally and work offline.</p>
      </section>`,
  },
  {
    path: 'contact',
    title: 'Contact — Oliver Newth',
    description:
      'Get in touch with Oliver Newth — AI safety, LED art, or coffee in San Francisco.',
    ogImage: '/og/contact.png',
    body: `
      <h1>Contact Oliver Newth</h1>
      <p>Happy to talk about AI safety or LED art, or grab coffee in San Francisco. Email: oliver@newth.ai</p>`,
  },
]

/* Per-piece pages: parse the literal meta objects out of the registry
   source so every /thinking/:slug ships its own title, description,
   canonical, OG tags, and CreativeWork structured data. The metas are
   uniform string literals; a parse miss throws here instead of silently
   serving the homepage head on 21 routes. */
const registrySrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/components/thinking/registry.tsx'),
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
for (const p of pieceMetas) {
  routes.push({
    path: `thinking/${p.id}`,
    title: `${p.title} — Oliver Newth`,
    description: p.dek.length > 160 ? `${p.dek.slice(0, 157).trimEnd()}…` : p.dek,
    ogImage: '/og/thinking.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      headline: p.title,
      description: p.dek,
      datePublished: p.date,
      author: { '@type': 'Person', name: 'Oliver Newth' },
      url: `https://n3wth.com/thinking/${p.id}/`,
    },
    body: `
      <h1>${p.title}</h1>
      <p>${p.dek}</p>
      <p><a href="/thinking">All Thinking pieces</a></p>`,
  })
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const template = readFileSync(join(dist, 'index.html'), 'utf8')

for (const r of routes) {
  let html = template
  const url = `${ORIGIN}/${r.path}`
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${r.title}</title>`)
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${esc(r.description)}$2`
  )
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${url}/$2`
  )
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
  html = html.replace(
    /(<meta property="og:description" content=")[^"]*(")/,
    `$1${esc(r.description)}$2`
  )
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}/$2`)
  html = html.replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    `$1${ORIGIN}${r.ogImage}$2`
  )
  html = html.replace(
    /(<meta name="twitter:image" content=")[^"]*(")/,
    `$1${ORIGIN}${r.ogImage}$2`
  )
  // Swap the home fallback content for this route's summary
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
  mkdirSync(join(dist, r.path), { recursive: true })
  writeFileSync(join(dist, r.path, 'index.html'), html)
  console.log(`[prerender-meta] dist/${r.path}/index.html`)
}
