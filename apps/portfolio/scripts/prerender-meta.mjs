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
      'Independent AI projects by Oliver Newth and product roles at Google, Covariant, Meta, and Microsoft.',
    ogImage: '/og/work.png',
    body: `
      <h1>Work — Oliver Newth</h1>
      <section>
        <h2>Experience</h2>
        <ul>
          <li>Google (2025 to present): AI Product Lead. Product development for AI platforms that integrate DeepMind models into production software.</li>
          <li>Covariant (2022–24): Staff Product Manager. Product work on computer vision for warehouse robotics.</li>
          <li>Meta (2017–22): Product Manager — video calling across Instagram and Portal; core growth and integrity. Build Social Value Award, 2020.</li>
          <li>Microsoft (2014–17): Product Manager, Azure. Product on Azure Cognitive Services; the job was getting enterprises to trust AI enough to adopt it.</li>
        </ul>
        <p>MEng in High Performance Structures, MIT (Kennedy Scholar); Civil Engineering, First Class, Warwick.</p>
      </section>
      <section>
        <h2>Independent projects</h2>
        <p>I build and operate these projects independently with coding agents. They are separate from my work at Google.</p>
        <ul>
          <li><a href="https://hop.flights" rel="noopener">hop.flights</a> — points-vs-cash flight optimizer.</li>
          <li><a href="https://lunchmoney.sh" rel="noopener">lunchmoney.sh</a> — unofficial Lunch Money plugin for Claude, Codex, and Cursor.</li>
          <li><a href="https://r3.n3wth.com" rel="noopener">r3</a>: memory for AI apps using vector search and knowledge graphs.</li>
          <li><a href="https://kit.n3wth.com" rel="noopener">kit</a>: a design system with context for coding agents.</li>
          <li><a href="https://skills.n3wth.com" rel="noopener">Agent Skills</a>: reusable instructions for coding agents.</li>
          <li><a href="https://github.com/n3wth/markup" rel="noopener">markup</a>: an independent prototype exploring personal AI agents in shared documents and chat.</li>
          <li><a href="https://garden.n3wth.com" rel="noopener">garden</a> — a digital garden of working notes.</li>
        </ul>
      </section>`,
  },
  {
    path: 'art',
    title: 'After dark — Oliver Newth',
    description:
      'Large-scale light installations for Burning Man and San Francisco memorials. THEM, Pink Triangle, and Circle of Light.',
    ogImage: '/og/art.png',
    body: `
      <h1>After dark — light installations by Oliver Newth</h1>
      <p>I build things that glow: large-scale light art in the desert and for San Francisco memorials.</p>
      <ul>
        <li>THEM — Lighting and Circle of Light ring. Design: Simón Malvaez. Fabrication: Brenden Blaine Darby. <a href="https://fundraising.fracturedatlas.org/them-a-burning-man-art-piece" rel="noopener noreferrer">Fractured Atlas</a>. Black Rock City, Nevada, 2022.</li>
        <li>Pink Triangle — Project coordination as part of <a href="https://illuminate.org/projects/the-pink-triangle/" rel="noopener noreferrer">Illuminate</a> on Patrick Carney’s Pride memorial. Twin Peaks, San Francisco, 2022.</li>
        <li>Circle of Light — World AIDS Day memorial for the <a href="https://www.aidsmemorial.org/grove" rel="noopener noreferrer">National AIDS Memorial</a>. AIDS Memorial Grove, San Francisco, 2021.</li>
      </ul>`,
  },
  {
    path: 'library',
    title: 'Library — Oliver Newth',
    description:
      'Installable pieces from across the n3wth properties: the essay kit behind the Thinking pieces, the @n3wth/ui component library, the digital garden, and agent skills.',
    ogImage: '/og/library.png',
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
        <p>Skills for coding assistants at <a href="https://skills.n3wth.com" rel="noopener">Agent Skills</a> covering development, documents, creative work, productivity and business. They run locally and work offline.</p>
      </section>`,
  },
  {
    path: 'contact',
    title: 'Contact — Oliver Newth',
    description:
      "Product, AI safety, or LED art. Coffee if you're in San Francisco.",
    ogImage: '/og/contact.png',
    body: `
      <h1>Contact Oliver Newth</h1>
      <p>Happy to talk about product work, AI safety, or LED art. Coffee if you're in San Francisco. Email: hey@n3wth.com</p>`,
  },
  {
    path: 'support',
    title: 'Support — Oliver Newth',
    description:
      'Support for n3wth projects — n3wth.com, hop.flights, lunchmoney.sh, and theywontshutup.com. Email support@n3wth.com.',
    ogImage: '/og-image.png',
    body: `
      <h1>Support</h1>
      <p>One inbox covers every n3wth project: <a href="mailto:support@n3wth.com">support@n3wth.com</a>.</p>
      <ul>
        <li><a href="https://n3wth.com">n3wth.com</a> — portfolio, writing, and experiments. support@n3wth.com</li>
        <li><a href="https://hop.flights" rel="noopener">hop.flights</a> — flight search and booking tools. support@hop.flights</li>
        <li><a href="https://lunchmoney.sh" rel="noopener">lunchmoney.sh</a> — unofficial Lunch Money plugin. support@n3wth.com</li>
        <li><a href="https://theywontshutup.com" rel="noopener">theywontshutup.com</a> — AI voice hotline. support@n3wth.com</li>
      </ul>`,
  },
  {
    path: 'elsa',
    title: 'Elsa · SMS Messaging Consent',
    description:
      "SMS messaging consent for Elsa, Oliver Newth's personal AI assistant on n3wth.com at +1 (415) 718-0992 and +1 (415) 360-0751.",
    ogImage: '/og-image.png',
    body: `
      <div class="elsa-hero">
        <svg class="elsa-hero-mark" viewBox="0 0 512 512" width="160" height="160" role="img" aria-label="Elsa" focusable="false" style="display:block;margin:0 auto 1.5rem">
          <rect width="512" height="512" rx="96" fill="#000"></rect>
          <g class="elsa-slash">
            <rect x="236" y="96" width="40" height="320" rx="20" fill="#fff" transform="rotate(28 256 256)"></rect>
          </g>
        </svg>
        <h1>Elsa</h1>
        <p>A personal AI assistant in your texts.</p>
        <p><a href="sms:+14157180992">+1 (415) 718-0992</a> · <a href="sms:+14153600751">+1 (415) 360-0751</a></p>
      </div>
      <p>Elsa is the personal AI assistant product name for messaging operated by Oliver Newth (sole proprietor) on n3wth.com. She helps with email, scheduling, purchases, and other tasks Oliver authorizes, over a simple text thread.</p>
      <ul>
        <li><strong>Email</strong>: Draft, triage, and follow up when Oliver asks.</li>
        <li><strong>Scheduling</strong>: Coordinate times and reminders over SMS.</li>
        <li><strong>Purchases</strong>: Run authorized buys and status updates.</li>
        <li><strong>Tasks</strong>: Anything else Oliver greenlights for Elsa.</li>
      </ul>
      <h2>How to text her</h2>
      <p>There is no website signup form, phone number field, or SMS consent checkbox on n3wth.com. Consumers opt in only by voluntarily texting <strong>+1 (415) 718-0992</strong> or <strong>+1 (415) 360-0751</strong> after reading this page. SMS is optional and is not required to use n3wth.com.</p>
      <p>Elsa has two numbers for the same assistant. Prefer the main line; use the alternate if the main line is busy or unavailable. Either number reaches Elsa.</p>
      <ul>
        <li>Main line: <a href="sms:+14157180992">+1 (415) 718-0992</a>. Preferred number. Same Elsa assistant. Send START, HELLO, or any first message.</li>
        <li>Alternate line: <a href="sms:+14153600751">+1 (415) 360-0751</a>. Use if the main line is busy or unavailable. Same Elsa assistant on either number.</li>
      </ul>
      <p>Or give Oliver / Elsa your mobile number and clearly agree to receive texts from either Elsa SMS line for assistant and transactional purposes.</p>
      <h2>What you will get</h2>
      <p>By opting in, you consent to receive automated SMS (and MMS when needed) from +1 (415) 718-0992 or +1 (415) 360-0751, including two-way assistant conversations, account and verification codes when Elsa is completing a task for Oliver that requires SMS OTP, transactional notices about tasks Elsa is running, and occasional service notices about the Elsa / n3wth assistant line. Message frequency varies (typically under 50/month). <strong>Message and data rates may apply.</strong></p>
      <p>Opt in by texting +1 (415) 718-0992 or +1 (415) 360-0751, or by clearly agreeing with Oliver / Elsa to receive assistant texts. Reply <strong>STOP</strong> to opt out. Reply <strong>HELP</strong> for help. Consent is voluntary and is not a condition of purchase. SMS is optional and is not required to browse n3wth.com, contact Oliver, or use other n3wth.com services. After opting out you will receive a one-time confirmation and no further messages will be sent unless you opt in again (for example reply START). See <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.</p>
      <h2>Privacy</h2>
      <p>Your phone number is used only to deliver Elsa / n3wth assistant-related SMS and to operate conversations you start. We do not sell or share mobile numbers with third parties or affiliates for their marketing. See the full <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.</p>
      <p>Last updated September 2026</p>`,
  },
  {
    path: 'privacy',
    title: 'Privacy Policy — Oliver Newth',
    description:
      "Privacy policy for n3wth.com - Oliver Newth's personal website.",
    ogImage: '/og-image.png',
    body: `
      <h1>Privacy Policy</h1>
      <p>Last updated: September 2026</p>
      <h2>Information Collection</h2>
      <p>Portfolio pages do not require accounts or tracking cookies. SMS/voice lines collect phone numbers and message content needed to operate those services.</p>
      <h2>They Won't Shut Up Hotline</h2>
      <p>Calls to +1 (855) 580-0508 may collect your number for follow-up SMS. Numbers are not sold or shared for third-party marketing. Reply STOP to opt out. See <a href="/consent">SMS Consent</a>.</p>
      <h2>Elsa assistant SMS</h2>
      <p>Opting in at +1 (415) 718-0992 (Telnyx) or +1 (415) 360-0751 (Twilio) collects your number and SMS content/metadata for assistant messages. Not sold or shared for marketing. Telnyx processes 718-0992; Twilio processes 360-0751. Reply STOP. Consent is not a condition of purchase. SMS is optional and is not required to use n3wth.com. See <a href="/elsa">/elsa</a>.</p>
      <h2>SMS data retention</h2>
      <p>SMS data retained up to 24 months unless needed longer for security, disputes, or law; deleted/anonymized sooner on verified STOP/deletion when feasible.</p>
      <h2>California privacy rights (CCPA/CPRA)</h2>
      <p>California residents may know/access, delete, and correct personal information. n3wth.com does not sell or share for cross-context behavioral advertising. Email hey@n3wth.com.</p>
      <h2>Third-Party Services</h2>
      <p>Hosted by Vercel. Telnyx processes SMS for Elsa (+1 415 718-0992). Twilio processes SMS for Elsa alternate (+1 415 360-0751) and the hotline (+1 855 580-0508).</p>`,
  },
  {
    path: 'terms',
    title: 'Terms of Service — n3wth',
    description:
      "Terms of service for n3wth.com and They Won't Shut Up AI voice hotline.",
    ogImage: '/og-image.png',
    body: `
      <h1>Terms of Service</h1>
      <p>Last updated: September 2026</p>
      <h2>1. Acceptance</h2>
      <p>By using n3wth.com or calling +1 (855) 580-0508, you agree to these terms.</p>
      <h2>4. SMS Messaging</h2>
      <p>Hotline callers may opt in to SMS. See <a href="/consent">SMS Consent</a>. Message and data rates may apply. Reply STOP. Privacy in the <a href="/privacy">Privacy Policy</a>.</p>
      <h2>Elsa assistant SMS</h2>
      <p>By texting +1 (415) 718-0992 or +1 (415) 360-0751 you agree to <a href="/elsa">/elsa</a>. Frequency varies. Message and data rates may apply. Reply STOP / HELP. SMS is optional and is not required to use n3wth.com. See <a href="/privacy">Privacy Policy</a>.</p>
      <h2>3. AI Disclosure</h2>
      <p>Hotline voices are AI-generated; not professional advice.</p>`,
  },
  {
    path: 'consent',
    title: "SMS Consent — They Won't Shut Up",
    description:
      "Opt in to receive SMS messages from They Won't Shut Up, an AI voice hotline by n3wth.com.",
    ogImage: '/og-image.png',
    body: `
      <h1>SMS Messaging Consent</h1>
      <p>Last updated: February 2026</p>
      <h2>About They Won't Shut Up</h2>
      <p>AI voice hotline at <strong>+1 (855) 580-0508</strong> operated by n3wth.com.</p>
      <h2>Messages</h2>
      <p>Call follow-ups and service notifications, up to 5 messages per month. Message and data rates may apply.</p>
      <h2>Opt in / opt out</h2>
      <p>Opt in by calling the hotline. Reply <strong>STOP</strong> to opt out. Reply <strong>HELP</strong> for help. See <a href="/privacy">Privacy Policy</a>.</p>
      <p>For the Elsa personal assistant SMS lines (+1 415 718-0992 Telnyx; +1 415 360-0751 Twilio), see <a href="/elsa">/elsa</a>.</p>`,
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
    description: p.dek,
    ogImage: `/og/thinking/${p.id}.png`,
    article: { published: p.date },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: p.title,
      description: p.dek,
      ...(summary ? { abstract: summary } : {}),
      datePublished: p.date,
      dateModified: p.date,
      image: `${ORIGIN}/og/thinking/${p.id}.png`,
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

/* Every route must ship a unique title and description — a duplicate or
   empty pair means two URLs present as the same page to crawlers. Throw
   here rather than emit the collision. */
const seenTitles = new Map()
const seenDescriptions = new Map()
for (const r of routes) {
  if (!r.title?.trim() || !r.description?.trim()) {
    throw new Error(`prerender-meta: /${r.path} is missing a title or description`)
  }
  if (seenTitles.has(r.title)) {
    throw new Error(`prerender-meta: /${r.path} shares a title with /${seenTitles.get(r.title)}`)
  }
  if (seenDescriptions.has(r.description)) {
    throw new Error(`prerender-meta: /${r.path} shares a description with /${seenDescriptions.get(r.description)}`)
  }
  seenTitles.set(r.title, r.path)
  seenDescriptions.set(r.description, r.path)
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const template = readFileSync(join(dist, 'index.html'), 'utf8')

const renderRoute = (r, outPath) => {
  let html = template
  /* The visually-hidden #seo-lead repeats the homepage description; drop it
     on routes where that copy is wrong (404, utility pages). */
  if (r.stripSeoLead) {
    html = html.replace(/\s*<p id="seo-lead">[\s\S]*?<\/p>/, '')
  }
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
      `  <script type="application/ld+json" data-page-json-ld>${JSON.stringify(r.jsonLd)}</script>\n  </head>`
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
    stripSeoLead: true,
    body: `
      <section aria-label="Page not found">
        <img src="/images/empty-playa.webp" alt="" style="width:100%;height:auto;margin-bottom:1.5rem" />
        <h1>This page doesn&rsquo;t exist</h1>
        <p>The link may be old, or the address mistyped (404).</p>
        <nav aria-label="Not found">
          <a href="/">Go home</a>
          <a href="/work">View work</a>
        </nav>
      </section>`,
  },
  join(dist, '404.html')
)
console.log('[prerender-meta] dist/404.html')

/* dist/sitemap.xml — generated from the same route list so it can't
   drift when a piece is added. lastmod only; Google ignores
   changefreq/priority. */
const latestPieceDate = pieceMetas.map((p) => p.date).sort().at(-1)
const sitemapEntries = [
  { loc: `${ORIGIN}/` },
  ...routes
    .filter((r) => !r.noindex)
    .map((r) => ({
      loc: `${ORIGIN}/${r.path}`,
      lastmod: r.article?.published,
    })),
]
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries
    .map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
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

/* llms-full.txt is referenced by robots.txt, so it must always exist.
   Base is the hand-written public/llms-full.txt (bio, stack, ecosystem);
   generated piece summaries are appended so assistants can quote the
   writing. Falls back to the llms.txt base if the file is missing. */
let llmsFullBase = llmsBase
try {
  llmsFullBase = readFileSync(
    join(here, '../public/llms-full.txt'),
    'utf8'
  ).trimEnd()
} catch {
  /* no hand-written base — llms.txt base is enough */
}
const llmsFull = pieceMetas
  .filter((p) => summaries[p.id])
  .map((p) => `# ${p.title} (${p.date})\n${ORIGIN}/thinking/${p.id}\n\n${summaries[p.id]}`)
  .join('\n\n---\n\n')
writeFileSync(
  join(dist, 'llms-full.txt'),
  `${llmsFullBase}${llmsFull ? `\n\n${llmsFull}` : ''}\n`
)
console.log('[prerender-meta] dist/llms-full.txt')