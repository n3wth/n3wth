'use client'

import Link from 'next/link'
import type { WorldNode } from '@/lib/worldLayout'
import { stageColor } from '@/lib/plant'

export const stageLabels: Record<string, string> = {
  seedling: 'Seedling',
  budding: 'Budding',
  evergreen: 'Evergreen',
}

interface FocusedNotePanelProps {
  note: WorldNode
  /** Connected notes, sorted most-linked first. */
  neighbors: WorldNode[]
  /** Slugs of notes the reader has already opened. */
  visited: Set<string>
  onSelectNeighbor: (id: string) => void
}

/**
 * The wander mechanic's payoff: what a note is, what it touches, and a
 * single way in. Shared between the 2D and 3D renderers so both worlds
 * offer the same walk.
 */
export function FocusedNotePanel({ note, neighbors, visited, onSelectNeighbor }: FocusedNotePanelProps) {
  return (
    <div
      className="glass-panel absolute z-20 flex flex-col gap-3 p-5 max-md:inset-x-3 max-md:bottom-3 max-md:max-h-[45vh] md:top-24 md:right-6 md:w-80 md:max-h-[70vh]"
      style={{ overflowY: 'auto' }}
    >
      <div>
        <p className="text-xs mb-1" style={{ color: stageColor[note.stage] || '#9aa0a8' }}>
          {stageLabels[note.stage] || note.stage}
        </p>
        <h2 className="font-display text-lg font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
          {note.title}
        </h2>
        {note.description && (
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {note.description}
          </p>
        )}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {note.tags.map((tag) => (
              <span key={tag} className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* the home note's slug is '' and its page is this world — send to the notes list instead */}
      <Link
        href={note.id === '' ? '/notes' : `/${note.id}`}
        className="rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors"
        style={{ background: 'var(--color-text-primary)', color: 'var(--color-background-body)' }}
      >
        {note.id === '' ? 'Browse all notes' : 'Read this note'}
      </Link>

      {neighbors.length > 0 && (
        <div>
          <p className="text-xs tracking-wide mb-2" style={{ color: 'var(--color-text-disabled)' }}>
            Connected · {neighbors.length}
          </p>
          <div className="flex flex-col gap-1">
            {neighbors.map((n) => {
              const seen = visited.has(n.id)
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onSelectNeighbor(n.id)}
                  className="rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                  style={{ color: seen ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)' }}
                >
                  <span
                    className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                    style={{ background: stageColor[n.stage] || '#9aa0a8' }}
                  />
                  {n.title}
                  {!seen && (
                    <span className="ml-2 text-[11px] tracking-wide" style={{ color: 'var(--color-text-disabled)' }}>
                      new
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
