'use client'

import { ReadingOutline } from '@n3wth/ui/site'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

const toOutlineItems = (headings: Heading[]) =>
  headings.map((h) => ({ id: h.id, label: h.text, level: h.level }))

/* Desktop sidebar TOC — Astryx Outline provides scroll-spy and the
   sliding active indicator. Positioning (sticky column) is owned by the
   note page so the TOC can stack with the sidebar mini-graph. */
export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length < 3) return null

  // h4+ is sub-detail; keeping the outline to three levels (and capping its
  // height) leaves room for the sidebar mini-graph below on long notes.
  const outline = headings.filter((h) => h.level <= 3)
  if (outline.length === 0) return null

  return (
    <div className="max-h-[calc(100vh-29rem)] overflow-y-auto">
      <ReadingOutline items={toOutlineItems(outline)} />
    </div>
  )
}

/* Compact "On this page" for narrow viewports, collapsed by default so it
   doesn't push the note content down. Rendered inline above the article. */
export function MobileToc({ headings }: TableOfContentsProps) {
  if (headings.length < 3) return null

  // level-2 only: opened on a phone it should read as a map of the note,
  // not a mirror of the whole document
  const sections = headings.filter((h) => h.level === 2)
  if (sections.length === 0) return null

  return (
    <div className="xl:hidden mb-8 max-w-md">
      <ReadingOutline items={toOutlineItems(sections)} collapsible />
    </div>
  )
}
