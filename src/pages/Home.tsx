import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Hero } from '../components/sections/Hero'
import { usePageMeta } from '../hooks/usePageMeta'
import { siteConfig } from '../data/content'

const chapters = [
  {
    href: '/work',
    title: 'Work',
    blurb: 'Ten years of AI in production at Google, Covariant, Meta, and Microsoft, and five products shipped with an agent team.',
  },
  {
    href: '/art',
    title: 'After dark',
    blurb: 'Large-scale light for the desert and the city: Burning Man sculpture and San Francisco memorials.',
  },
  {
    href: '/thinking',
    title: 'Thinking',
    blurb: 'Positions on production AI, agents as an org design problem, and the real trade-offs in AI safety calls.',
  },
]

export default function Home() {
  usePageMeta(siteConfig.title, siteConfig.description)

  return (
    <>
      <Hero />

      {/* Chapter index — the front door to the rest of the site */}
      <nav aria-label="Site chapters" className="section-pad pad-air">
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {chapters.map((chapter) => (
            <li key={chapter.href}>
              <Link
                to={chapter.href}
                className="cell group flex h-full flex-col p-6 md:p-7"
              >
                <span className="flex items-center justify-between">
                  <span
                    className="display text-xl md:text-2xl"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {chapter.title}
                  </span>
                  <ArrowRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: 'var(--ink-faint)' }}
                  />
                </span>
                <span
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  {chapter.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
