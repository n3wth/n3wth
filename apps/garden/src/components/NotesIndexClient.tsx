'use client'

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'next-view-transitions'
import { TextInput } from '@astryxdesign/core/TextInput'
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { PlantGlyph } from '@/components/PlantGlyph'
import { getVisited } from '@/lib/visited'
import type { GrowthStage as GrowthStageType } from '@/lib/content'

export interface NoteListItem {
  slug: string
  title: string
  description: string
  tags: string[]
  stage: GrowthStageType
  readingTime: string
  linkCount: number
  created: number
  modified: number
}

const STAGES: { value: GrowthStageType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'seedling', label: 'Seedlings' },
  { value: 'budding', label: 'Budding' },
  { value: 'evergreen', label: 'Evergreen' },
]

type SortKey = 'tended' | 'planted' | 'connected' | 'title'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'tended', label: 'Tended' },
  { value: 'planted', label: 'Planted' },
  { value: 'connected', label: 'Linked' },
  { value: 'title', label: 'Title' },
]

/* Date only — the Tended sort control names the column, so printing
   "tended" on every one of ~256 rows was ink without information. */
function tendedLabel(ms: number): string {
  if (!ms) return ''
  const days = Math.floor((Date.now() - ms) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/* One meta column, keyed to whatever the reader sorted by — the band
   headers already name the dimension, so the row only needs to answer
   "how much" for that same dimension, at every breakpoint. */
function metaLabel(note: NoteListItem, sort: SortKey): string {
  switch (sort) {
    case 'tended':
      return tendedLabel(note.modified) || '—'
    case 'planted':
      return note.created ? String(new Date(note.created).getFullYear()) : '—'
    default:
      return note.linkCount > 0 ? `${note.linkCount} link${note.linkCount !== 1 ? 's' : ''}` : '—'
  }
}

/* 252 notes in one unbroken run gave the reader no idea where they were
   after the first screen. Each sort now cuts the list into bands and
   labels them, so the scroll reports its own position — and the bands
   say something the flat list could not: how much of the garden is
   freshly tended, how much of it is actually linked to anything. */
function bandFor(note: NoteListItem, sort: SortKey): string {
  switch (sort) {
    case 'tended':
    case 'planted': {
      const ms = sort === 'tended' ? note.modified : note.created
      if (!ms) return 'Undated'
      const days = Math.floor((Date.now() - ms) / 86400000)
      if (days < 30) return sort === 'tended' ? 'Tended this month' : 'Planted this month'
      if (days < 365) return sort === 'tended' ? 'Tended this year' : 'Planted this year'
      return String(new Date(ms).getFullYear())
    }
    case 'connected': {
      if (note.linkCount === 0) return 'Standing alone'
      if (note.linkCount < 3) return 'A thread or two'
      if (note.linkCount < 10) return 'Well linked'
      return 'Deep in the thicket'
    }
    default: {
      const c = note.title.trim().charAt(0).toUpperCase()
      return /[A-Z]/.test(c) ? c : '#'
    }
  }
}

function groupByBand(
  list: NoteListItem[],
  sort: SortKey
): { band: string; notes: NoteListItem[] }[] {
  const bands: { band: string; notes: NoteListItem[] }[] = []
  for (const note of list) {
    const band = bandFor(note, sort)
    const last = bands[bands.length - 1]
    if (last && last.band === band) last.notes.push(note)
    else bands.push({ band, notes: [note] })
  }
  return bands
}

export function NotesIndexClient({ notes }: { notes: NoteListItem[] }) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState<GrowthStageType | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('title')
  const [visited, setVisited] = useState<Record<string, number>>({})

  useEffect(() => {
    setVisited(getVisited())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = notes.filter((note) => {
      if (stage !== 'all' && note.stage !== stage) return false
      if (!q) return true
      return (
        note.title.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        note.tags.some((t) => t.includes(q))
      )
    })
    switch (sort) {
      case 'tended':
        return [...list].sort((a, b) => b.modified - a.modified)
      case 'planted':
        return [...list].sort((a, b) => b.created - a.created)
      case 'connected':
        return [...list].sort((a, b) => b.linkCount - a.linkCount)
      default:
        return list // server-sorted A–Z
    }
  }, [notes, query, stage, sort])

  const bands = useMemo(() => groupByBand(filtered, sort), [filtered, sort])

  const exploredHere = useMemo(
    () => notes.filter((n) => n.slug in visited).length,
    [notes, visited]
  )

  // The most recently opened note — an offer to pick the walk back up.
  const lastWalked = useMemo(() => {
    let best: NoteListItem | null = null
    let bestTime = 0
    for (const n of notes) {
      const t = visited[n.slug]
      if (t && t > bestTime) {
        bestTime = t
        best = n
      }
    }
    return best
  }, [notes, visited])

  return (
    <div>
      {/* One row on desktop: search grows, both segmented controls hold
          their width. whitespace-nowrap keeps segment labels on one line. */}
      <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-center whitespace-nowrap">
        <div className="w-full lg:flex-1 lg:min-w-0 lg:max-w-sm">
          <TextInput
            label="Search notes"
            isLabelHidden
            value={query}
            onChange={setQuery}
            placeholder={`Search ${notes.length} notes…`}
            size="sm"
          />
        </div>
        <SegmentedControl
          value={stage}
          onChange={(value) => setStage(value as GrowthStageType | 'all')}
          label="Filter by growth stage"
          size="sm"
        >
          {STAGES.map((s) => (
            <SegmentedControlItem key={s.value} value={s.value} label={s.label} />
          ))}
        </SegmentedControl>
        <SegmentedControl
          value={sort}
          onChange={(value) => setSort(value as SortKey)}
          label="Sort notes"
          size="sm"
        >
          {SORTS.map((s) => (
            <SegmentedControlItem key={s.value} value={s.value} label={s.label} />
          ))}
        </SegmentedControl>
      </div>
      {exploredHere > 0 && (
        <p className="mb-6 text-xs text-[var(--color-text-disabled)]">
          You&rsquo;ve explored {exploredHere} of {notes.length} — the dimmed rows are where you&rsquo;ve been.
          {lastWalked && (
            <>
              {' '}
              <Link
                href={`/${lastWalked.slug}`}
                className="text-[var(--color-text-secondary)] underline underline-offset-2 decoration-[var(--color-border-emphasized)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Pick up at {lastWalked.title} →
              </Link>
            </>
          )}
        </p>
      )}
      {exploredHere === 0 && <div className="mb-6" />}

      {filtered.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title={`No notes match “${query}”`}
            description="Try a different search or clear the filters."
          />
        </div>
      ) : (
        <div>
          {bands.map(({ band, notes: bandNotes }, bandIndex) => (
            <section key={band} aria-labelledby={`band-${bandIndex}`}>
              <h2
                id={`band-${bandIndex}`}
                className="field-band sticky top-[72px] z-10 flex items-baseline justify-between gap-4 py-2 text-[11px] tracking-[0.08em] text-[var(--color-text-disabled)]"
              >
                <span>{band}</span>
                <span className="tabular-nums">{bandNotes.length}</span>
              </h2>
              <ul className="divide-y divide-[var(--color-border)]">
          {bandNotes.map((note, i) => {
            const seen = note.slug in visited
            return (
              <li
                key={note.slug}
                className="note-row"
                style={{ '--row-i': Math.min(i, 12) } as React.CSSProperties}
              >
                <Link
                  href={`/${note.slug}`}
                  className="group press flex items-center gap-4 py-3 px-2 -mx-2 rounded-lg hover:bg-[var(--color-overlay-hover)] transition-colors"
                  onClick={(e) => {
                    /* Name only the clicked row's title so the view transition
                       morphs it into the note page's h1 — naming every row
                       would snapshot all of them. */
                    const title = e.currentTarget.querySelector<HTMLElement>('.note-row-title')
                    if (title) title.style.viewTransitionName = 'note-title'
                  }}
                >
                  <span className={`shrink-0 w-6 flex justify-center ${seen ? 'opacity-70' : ''}`}>
                    <PlantGlyph slug={note.slug} stage={note.stage} linkCount={note.linkCount} size={30} />
                    <span className="sr-only">{note.stage}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`note-row-title block truncate text-sm font-medium transition-colors ${
                        seen
                          ? 'text-[var(--color-text-secondary)]'
                          : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-text-accent)]'
                      }`}
                    >
                      {note.title}
                    </span>
                    <span className="block truncate text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {note.description || `${note.stage} · ${note.readingTime}`}
                    </span>
                  </span>
                  <span className="shrink-0 w-20 text-right text-xs text-[var(--color-text-disabled)] tabular-nums">
                    {metaLabel(note, sort)}
                  </span>
                  <span
                    aria-hidden
                    className="hidden sm:block shrink-0 text-[var(--color-text-disabled)] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    →
                  </span>
                </Link>
              </li>
            )
          })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
