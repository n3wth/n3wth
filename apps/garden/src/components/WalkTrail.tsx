'use client'

import { useEffect, useState } from 'react'
import { Link } from 'next-view-transitions'

/* This session's walk through the garden, kept in sessionStorage — the
   short-term companion to the localStorage worn paths. Stepping back to
   a note you passed earlier rewinds the trail to that point, the way a
   walk actually works. */

const KEY = 'garden:walk'
const MAX_STEPS = 24
/* Three, not four. Note titles here run to seventy characters ("Atomic
   Habits: An Easy & Proven Way to…"), and four of them chained into a
   sentence produced a paragraph of link soup at the foot of every page. */
const SHOWN_STEPS = 3

interface Step {
  slug: string
  title: string
}

function readTrail(): Step[] {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s): s is Step => s && typeof s.slug === 'string' && typeof s.title === 'string'
    )
  } catch {
    return []
  }
}

export function WalkTrail({ slug, title }: { slug: string; title: string }) {
  const [previous, setPrevious] = useState<Step[]>([])

  useEffect(() => {
    try {
      const trail = readTrail()
      const at = trail.findIndex((s) => s.slug === slug)
      const base = at === -1 ? trail : trail.slice(0, at)
      setPrevious(base.slice(-SHOWN_STEPS))
      window.sessionStorage.setItem(
        KEY,
        JSON.stringify([...base, { slug, title }].slice(-MAX_STEPS))
      )
    } catch {
      // storage blocked — the walk is a nicety, never an error
    }
  }, [slug, title])

  if (previous.length === 0) return null

  return (
    <nav aria-label="Your walk through the garden" className="mt-6">
      <p className="label mb-2">Your walk</p>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {previous.map((step) => (
          <li key={step.slug} className="flex items-center gap-2 min-w-0">
            <Link
              href={`/${step.slug}`}
              title={step.title}
              className="block max-w-[18ch] truncate text-xs text-[var(--color-text-secondary)] underline decoration-transparent underline-offset-4 transition-colors hover:text-[var(--color-text-primary)] hover:decoration-[var(--color-border-emphasized)]"
            >
              {step.title}
            </Link>
            <span aria-hidden className="text-[var(--color-text-disabled)]">
              →
            </span>
          </li>
        ))}
        <li className="text-xs text-[var(--color-text-disabled)]">this note</li>
      </ol>
    </nav>
  )
}
