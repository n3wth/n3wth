import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { searchItems } from '../lib/search'
import { track } from '../lib/analytics'
import type { ResultGroup, SearchItem } from '../lib/search'
import { registeredPieces } from './thinking/registry'
import { ecosystem, kitPrimitives, uiTiers, uiHooks } from '../data/library'

/**
 * One input over four properties: this site's routes, every Thinking piece,
 * every kit primitive and @n3wth/ui component, and all of the garden.
 *
 * The garden is the reason this file is careful about imports. It is a few
 * hundred notes and roughly 50KB of JSON, so it arrives through a dynamic
 * import the first time the palette opens and never touches the entry chunk.
 * Everything else is small, static, and derived from the same modules the
 * pages themselves render from, so the palette can't drift out of sync with
 * what actually ships.
 *
 * registeredPieces is imported for its `meta` only. The piece bodies behind
 * it are React.lazy() calls, so this import moves metadata, not essays, and
 * registry.tsx is already in the entry chunk by way of src/pages/Thinking.tsx.
 */

/** How many results are drawn at once. The true match count is still shown. */
const MAX_RESULTS = 40

/* Mirrors the route table in src/main.tsx minus the utility routes
   (/error, /login, /logout, 404), which nobody searches for.
   A new user-facing route must be added here too. */
const PAGES: SearchItem[] = [
  {
    id: 'page-home',
    title: 'Home',
    subtitle: 'One full-screen scene, and the way into the rest of it',
    href: '/',
    group: 'Pages',
  },
  {
    id: 'page-work',
    title: 'Work',
    subtitle: 'A decade of AI in production, plus the products built alongside it',
    href: '/work',
    group: 'Pages',
  },
  {
    id: 'page-art',
    title: 'After dark',
    subtitle: 'Light installations for Burning Man and San Francisco memorials',
    href: '/art',
    group: 'Pages',
  },
  {
    id: 'page-thinking',
    title: 'Thinking',
    subtitle: 'Positions on production AI, and the build logs they came out of',
    href: '/thinking',
    group: 'Pages',
  },
  {
    id: 'page-library',
    title: 'Library',
    subtitle: 'The essay kit, @n3wth/ui, the garden: what exists and how to start',
    href: '/library',
    group: 'Pages',
  },
  {
    id: 'page-contact',
    title: 'Contact',
    subtitle: 'Email, GitHub, LinkedIn',
    href: '/contact',
    group: 'Pages',
  },
  {
    id: 'page-support',
    title: 'Support',
    subtitle: 'One inbox for n3wth.com, hop.flights and theywontshutup.com',
    href: '/support',
    group: 'Pages',
  },
]

const THINKING: SearchItem[] = registeredPieces.map(({ meta }) => ({
  id: `thinking-${meta.id}`,
  title: meta.title,
  subtitle: meta.dek,
  href: `/thinking/${meta.id}`,
  group: 'Thinking',
}))

/** Blurbs are written to be read on /library, which has room for them. */
function firstSentence(text: string): string {
  const stop = text.indexOf('. ')
  return stop === -1 ? text : text.slice(0, stop + 1)
}

const KIT: SearchItem[] = kitPrimitives.map((primitive) => ({
  id: `kit-${primitive.id}`,
  title: primitive.name,
  subtitle: firstSentence(primitive.blurb),
  href: `/library#kit-${primitive.id}`,
  group: 'Library',
}))

const HOOKS: SearchItem[] = uiHooks.map((name) => ({
  id: `ui-hook-${name.toLowerCase()}`,
  title: name,
  subtitle: '@n3wth/ui hook',
  href: `/library#ui-hook-${name.toLowerCase()}`,
  group: 'Library' as ResultGroup,
}))

const UI: SearchItem[] = uiTiers.flatMap((tier) => {
  const tierLabel = tier.name.replace(/s$/, '').toLowerCase()
  return tier.components.map((name) => ({
    id: `ui-${name.toLowerCase()}`,
    title: name,
    subtitle: `@n3wth/ui ${tierLabel}`,
    href: `/library#ui-${name.toLowerCase()}`,
    group: 'Library' as ResultGroup,
  }))
})

/* n3wth.com is one of the four, and its href is a route rather than a URL,
   so `external` is read off the href instead of assumed. */
const ELSEWHERE: SearchItem[] = ecosystem.map((property) => ({
  id: `elsewhere-${property.id}`,
  title: property.name,
  subtitle: property.purpose,
  href: property.href,
  external: property.href.startsWith('http'),
  group: 'Elsewhere',
}))

const STATIC_ITEMS: SearchItem[] = [...PAGES, ...THINKING, ...KIT, ...UI, ...HOOKS, ...ELSEWHERE]

/** The answer endpoint returns markdown links only ([text](href)) — this
    splits on that one pattern rather than pulling in a markdown parser
    for a single construct. */
function renderAnswerLinks(text: string): Array<string | { label: string; href: string }> {
  const parts: Array<string | { label: string; href: string }> = []
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = linkRe.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push({ label: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

const page = (id: string): SearchItem => {
  const found = PAGES.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown page in the command palette: ${id}`)
  return found
}

/** An empty input is a worse first impression than a short opinionated list. */
const START_HERE: SearchItem[] = [
  page('page-library'),
  page('page-work'),
  page('page-thinking'),
  ...THINKING.slice(0, 2),
]

interface GardenNote {
  title: string
  href: string
  /** Empty string, not undefined, when llms.txt carried no description. */
  description: string
  section: string | null
}

/** src/data/garden-search.json — the note list, kept out of the main bundle
    and pulled in the first time the palette opens. */
interface GardenSearchIndex {
  notes: GardenNote[]
}

interface RenderGroup {
  group: ResultGroup
  items: SearchItem[]
  /** Where this group's first row sits in the flat keyboard order. */
  startIndex: number
}

const LIST_ID = 'command-palette-results'
const optionId = (index: number) => `command-palette-option-${index}`

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [gardenItems, setGardenItems] = useState<SearchItem[]>([])
  const [gardenReady, setGardenReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [askState, setAskState] = useState<'idle' | 'loading' | 'answered' | 'error'>('idle')
  const [askAnswer, setAskAnswer] = useState('')

  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const requestedGarden = useRef(false)

  /* The garden lands on first open and stays for the session. A failed fetch
     clears the latch so the next open tries again; the other four groups are
     already on screen either way.

     No abort flag here on purpose: StrictMode mounts effects twice in dev, so
     a flag set by the first teardown would cancel the only request the latch
     ever allows and leave the garden permanently missing in development. */
  useEffect(() => {
    if (!open || requestedGarden.current) return
    requestedGarden.current = true

    import('../data/garden-search.json')
      .then((module) => {
        const index = module.default as GardenSearchIndex
        setGardenItems(
          index.notes.map((note) => ({
            id: `garden-${note.href}`,
            title: note.title,
            subtitle:
              [note.description, note.section]
                .filter((part): part is string => Boolean(part && part.length > 0))
                .join(' · ') || undefined,
            href: note.href,
            external: true,
            group: 'Garden' as ResultGroup,
          }))
        )
        setGardenReady(true)
      })
      .catch(() => {
        requestedGarden.current = false
      })
  }, [open])

  /* Every open starts clean: empty query, first result active, focus in the
     input, and a note of where focus came from so Escape can hand it back. */
  useEffect(() => {
    if (!open) {
      setEntered(false)
      if (openerRef.current?.isConnected) openerRef.current.focus()
      openerRef.current = null
      return
    }
    openerRef.current = (document.activeElement as HTMLElement | null) ?? null
    track('command_palette_opened')
    setQuery('')
    setActiveIndex(0)
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    inputRef.current?.focus()
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [open])

  // Same lock the mobile nav sheet uses, so the page behind can't scroll away.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const items = useMemo(() => [...STATIC_ITEMS, ...gardenItems], [gardenItems])
  const trimmed = query.trim()
  const matches = useMemo(
    () => (trimmed.length === 0 ? START_HERE : searchItems(items, trimmed)),
    [items, trimmed]
  )

  /* Groups appear in the order their best result did, so the strongest match
     is always the first row rather than buried under whichever group happens
     to sort first. Within a group, score order survives. */
  const rendered = useMemo(() => {
    const shown = matches.slice(0, MAX_RESULTS)
    const groups: RenderGroup[] = []
    const buckets = new Map<ResultGroup, SearchItem[]>()
    for (const item of shown) {
      const bucket = buckets.get(item.group)
      if (bucket) {
        bucket.push(item)
      } else {
        const created = [item]
        buckets.set(item.group, created)
        groups.push({ group: item.group, items: created, startIndex: 0 })
      }
    }
    let offset = 0
    for (const group of groups) {
      group.startIndex = offset
      offset += group.items.length
    }
    return groups
  }, [matches])

  const flat = useMemo(() => rendered.flatMap((group) => group.items), [rendered])
  const safeIndex = flat.length === 0 ? -1 : Math.min(activeIndex, flat.length - 1)

  useEffect(() => {
    setActiveIndex(0)
    setAskState('idle')
    setAskAnswer('')
  }, [trimmed])

  const askAi = useCallback(async () => {
    if (trimmed.length === 0 || askState === 'loading') return
    setAskState('loading')
    track('ai_search_asked', { query_length: trimmed.length })
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          candidates: flat.slice(0, 15).map((item) => ({
            title: item.title,
            subtitle: item.subtitle,
            href: item.href,
          })),
        }),
      })
      const data = (await response.json()) as { answer?: string }
      if (!data.answer) throw new Error('empty answer')
      setAskAnswer(data.answer)
      setAskState('answered')
    } catch {
      setAskState('error')
    }
  }, [trimmed, flat, askState])

  useEffect(() => {
    if (safeIndex < 0) return
    // Optional call, not paranoia: jsdom ships no scrollIntoView, and a
    // render test of this component shouldn't have to stub one in.
    document.getElementById(optionId(safeIndex))?.scrollIntoView?.({ block: 'nearest' })
  }, [safeIndex, rendered])

  const activate = useCallback(
    (item: SearchItem) => {
      track('command_palette_result_selected', { href: item.href, group: item.group })
      onClose()
      if (item.external) {
        window.open(item.href, '_blank', 'noopener,noreferrer')
        return
      }
      navigate(item.href)
    },
    [navigate, onClose]
  )

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href]:not([tabindex="-1"]), button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
      return
    }

    if (flat.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % flat.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + flat.length) % flat.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(flat.length - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = flat[safeIndex]
      if (item) activate(item)
    }
  }

  const onResultClick = (item: SearchItem) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
    // Let ⌘-click, middle-click and "open in new tab" behave like the link
    // the href already promises.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    activate(item)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: 'var(--bg)',
          opacity: entered ? 0.82 : 0,
          transition: 'opacity 180ms var(--ease)',
        }}
      />

      <div
        /* items-start, not the flex default: stretch would blow the panel out
           to the full column height, so a single result would sit at the top
           of an otherwise empty 700px box. It hugs its content and caps at
           maxHeight instead. */
        className="absolute inset-0 flex items-start justify-center overflow-hidden px-3 sm:px-4"
        style={{ paddingTop: '14vh', paddingBottom: '6vh' }}
        /* This wrapper sits above the backdrop, so clicks in the space
           around the panel land here — treat them as clicks off. */
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search n3wth.com"
          onKeyDown={onPanelKeyDown}
          className="flex w-full flex-col overflow-hidden"
          style={{
            maxWidth: '640px',
            maxHeight: '100%',
            background: 'var(--bg-raise)',
            border: '1px solid var(--rail)',
            borderRadius: '16px',
            opacity: entered ? 1 : 0,
            transform: reduceMotion || entered ? 'none' : 'translateY(-8px)',
            transition: reduceMotion
              ? 'opacity 140ms linear'
              : 'opacity 180ms var(--ease), transform 180ms var(--ease)',
          }}
        >
          {/* Input row */}
          <div
            className="flex shrink-0 items-center gap-3 px-4"
            style={{ borderBottom: '1px solid var(--rail)' }}
          >
            <Search size={16} strokeWidth={1.5} style={{ color: 'var(--ink-faint)' }} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              role="combobox"
              aria-expanded="true"
              aria-controls={LIST_ID}
              aria-autocomplete="list"
              aria-label="Search pages, pieces, components and garden notes"
              aria-activedescendant={safeIndex >= 0 ? optionId(safeIndex) : undefined}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search everything"
              className="command-palette-input min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-[color:var(--ink-dim)]"
              style={{ color: 'var(--ink)', height: '52px' }}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="inline-flex shrink-0 items-center justify-center"
              style={{ color: 'var(--ink-dim)', width: '44px', height: '44px', margin: '0 -12px 0 0' }}
            >
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          {trimmed.length > 0 && (
            <div className="shrink-0 px-4 py-2.5" style={{ borderBottom: '1px solid var(--rail)' }}>
              {askState === 'idle' && (
                <button
                  type="button"
                  onClick={askAi}
                  className="font-sans text-sm underline underline-offset-4"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  Ask AI about &ldquo;{trimmed}&rdquo;
                </button>
              )}
              {askState === 'loading' && (
                <p className="font-sans text-sm" style={{ color: 'var(--ink-dim)' }} aria-live="polite">
                  Thinking…
                </p>
              )}
              {askState === 'error' && (
                <p className="font-sans text-sm" style={{ color: 'var(--ink-dim)' }} aria-live="polite">
                  Couldn&rsquo;t reach the answering service — the results below still work.
                </p>
              )}
              {askState === 'answered' && (
                <p
                  className="font-sans text-sm leading-relaxed"
                  style={{ color: 'var(--ink)' }}
                  aria-live="polite"
                >
                  {renderAnswerLinks(askAnswer).map((part, i) =>
                    typeof part === 'string' ? (
                      <span key={i}>{part}</span>
                    ) : (
                      <a
                        key={i}
                        href={part.href}
                        className="underline underline-offset-4"
                        style={{ color: 'var(--ink)' }}
                        {...(part.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        onClick={(event) => {
                          if (part.href.startsWith('http')) return
                          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
                          event.preventDefault()
                          onClose()
                          navigate(part.href)
                        }}
                      >
                        {part.label}
                      </a>
                    )
                  )}
                </p>
              )}
            </div>
          )}

          <p role="status" aria-live="polite" className="sr-only">
            {flat.length === 0
              ? 'No results'
              : `${matches.length} result${matches.length === 1 ? '' : 's'}`}
          </p>

          {/* Results */}
          <div
            ref={listRef}
            id={LIST_ID}
            role="listbox"
            aria-label="Search results"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"
          >
            {flat.length === 0 ? (
              <p className="px-4 py-6 font-sans text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                {gardenReady
                  ? `Nothing matches “${trimmed}”. Try one word instead of a phrase.`
                  : `Nothing matches “${trimmed}” yet; the garden notes are still loading.`}
              </p>
            ) : (
              rendered.map((group) => {
                const labelId = `command-palette-group-${group.group.toLowerCase()}`
                return (
                  <div key={group.group} role="group" aria-labelledby={labelId} className="pb-1">
                    <p
                      id={labelId}
                      className="px-4 pb-1 pt-3 font-sans text-xs"
                      style={{ color: 'var(--ink-dim)', fontWeight: 500, letterSpacing: '0.04em' }}
                    >
                      {group.group}
                    </p>
                    {group.items.map((item, offset) => {
                      const index = group.startIndex + offset
                      const isActive = index === safeIndex
                      return (
                        <a
                          key={item.id}
                          id={optionId(index)}
                          role="option"
                          aria-selected={isActive}
                          tabIndex={-1}
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noreferrer' : undefined}
                          onClick={onResultClick(item)}
                          onMouseMove={() => setActiveIndex(index)}
                          className="flex flex-col justify-center gap-0.5 px-4 py-2"
                          style={{
                            minHeight: '44px',
                            borderLeft: '2px solid',
                            borderLeftColor: isActive ? 'var(--accent-rail)' : 'transparent',
                            background: isActive
                              ? 'color-mix(in srgb, var(--ink) 6%, transparent)'
                              : 'transparent',
                            textDecoration: 'none',
                          }}
                        >
                          <span
                            className="truncate font-sans text-sm"
                            style={{ color: 'var(--ink)', fontWeight: isActive ? 500 : 400 }}
                          >
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span
                              className="truncate font-sans text-xs"
                              style={{ color: 'var(--ink-dim)' }}
                            >
                              {item.subtitle}
                            </span>
                          )}
                        </a>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
