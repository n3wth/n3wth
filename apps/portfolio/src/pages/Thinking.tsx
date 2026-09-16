import { Thinking as Positions } from '../components/sections/Thinking'
import { ForkLight, VisualBand } from '@n3wth/ui/visuals'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import gardenNotes from '../data/garden-notes.json'

const TITLE = 'Thinking — Oliver Newth'
const DESCRIPTION = 'Positions on production AI and agents as an org design problem, plus interactive walk-throughs of real AI safety trade-offs.'

interface GardenNote {
  title: string
  href: string
  description: string
  date: string
}

/* Recent garden notes, snapshotted at build time
   (scripts/fetch-garden-notes.mjs). If the feed is down, the last
   committed snapshot ships. */
function GardenNotes() {
  const notes = (gardenNotes as GardenNote[]).slice(0, 4)
  if (notes.length === 0) return null
  return (
    <section aria-label="Garden notes" className="frame">
      <div className="section-pad">
        <p className="max-w-xl text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
          Recent notes from{' '}
          <a href="https://garden.n3wth.com" className="link-underline" style={{ color: 'var(--ink)' }}>
            the garden
          </a>
          .
        </p>
        <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {notes.map((n) => (
            <li key={n.href} className="max-w-lg">
              <a href={n.href} className="link-underline text-base md:text-lg" style={{ color: 'var(--ink)' }}>
                {n.title}
              </a>
              {n.description && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                  {n.description}
                </p>
              )}
              <p className="meta mt-2">
                {new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function ThinkingPage() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og/thinking.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/thinking',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Thinking', url: 'https://n3wth.com/thinking' },
      ],
    }),
  })

  return (
    <>
      <Positions />
      <VisualBand height="clamp(220px, 42svh, 420px)">
        <ForkLight />
      </VisualBand>
      <GardenNotes />
    </>
  )
}
