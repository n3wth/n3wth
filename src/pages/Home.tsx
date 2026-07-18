import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Hero } from '../components/sections/Hero'
import { usePageMeta } from '../hooks/usePageMeta'
import { siteConfig } from '../data/content'

const chapters = [
  {
    href: '/work',
    title: 'Work',
    blurb: 'The ship log: ten years of production AI, and the five products my agent team keeps live.',
  },
  {
    href: '/art',
    title: 'After dark',
    blurb: 'Three light installations, from Black Rock City to Twin Peaks.',
  },
  {
    href: '/thinking',
    title: 'Thinking',
    blurb: 'What a decade of production AI taught me, including the calls with no clean answer.',
  },
]

export default function Home() {
  usePageMeta(siteConfig.title, siteConfig.description)

  return (
    <>
      <Hero />

      {/* Chapter index — the front door to the rest of the site */}
      <nav aria-label="Site chapters" className="section-pad pad-air">
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
          {chapters.map((chapter, i) => (
            <li key={chapter.href} className={i === 0 ? 'md:col-span-2' : undefined}>
              <Link
                to={chapter.href}
                viewTransition
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
