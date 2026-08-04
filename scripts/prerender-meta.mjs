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
      'A decade of AI in production across Google, Covariant, Meta, and Microsoft — and five products designed by hand, shipped by an agent team.',
    ogImage: '/og/work.png',
    body: `
      <h1>Work — Oliver Newth</h1>
      <section>
        <h2>A decade of AI, in production</h2>
        <p>Ten years taking AI from research demos to production at Google, Covariant, Meta, and Microsoft.</p>
        <ul>
          <li>Google (2024–): AI Product Leader — Gemini-powered products across Google's GenAI platform, working with DeepMind. Spoke at I/O 2025 on responsible AI in production.</li>
          <li>Covariant (2022–24): Senior Product Manager — computer vision from research demos to warehouse floors running 24/7, through Amazon's acquisition.</li>
          <li>Meta (2019–22): Product Manager, Instagram — launched video calling on Instagram at 750M daily users.</li>
          <li>Microsoft (2016–19): Product Manager, Azure — built Azure Cognitive Services and the playbook for enterprise AI adoption.</li>
        </ul>
      </section>
      <section>
        <h2>Designed by hand, shipped by agents</h2>
        <p>Five products in production, designed by Oliver and kept shipping by a standing team of autonomous agents: r3 (persistent memory for AI apps), kit (47 components with AI context packs), hop.flights (points-vs-cash flight optimizer), and more.</p>
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
        <li>THEM — monumental light sculpture, Burning Man, Black Rock Desert.</li>
        <li>Pink Triangle — illuminated LGBTQIA+ memorial on Twin Peaks during Pride Month, San Francisco.</li>
        <li>Circle of Light — World AIDS Day memorial installation, San Francisco (2021).</li>
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
  html = html.replace(
    /<main id="main" class="seo-fallback">[\s\S]*?<\/main>/,
    `<main id="main" class="seo-fallback">${r.body}\n      </main>`
  )
  mkdirSync(join(dist, r.path), { recursive: true })
  writeFileSync(join(dist, r.path, 'index.html'), html)
  console.log(`[prerender-meta] dist/${r.path}/index.html`)
}
