'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { getVisited } from '@/lib/visited'
import { PlantGlyph } from '@/components/PlantGlyph'

interface PreviewData {
  title: string
  excerpt: string
  tags: string[]
  stage: 'seedling' | 'budding' | 'evergreen'
  readingTime: string
  linkCount: number
  planted?: string
}

interface LinkPreviewProps {
  previews: Record<string, PreviewData>
}

const stageLabels: Record<string, string> = {
  seedling: 'Seedling',
  budding: 'Budding',
  evergreen: 'Evergreen',
}

export function LinkPreview({ previews }: LinkPreviewProps) {
  const [visible, setVisible] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [slug, setSlug] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [walked, setWalked] = useState(false)
  const [above, setAbove] = useState(true)
  const [fading, setFading] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const portalRef = useRef<HTMLDivElement | null>(null)

  const show = useCallback((link: HTMLElement) => {
    const href = link.getAttribute('href')
    if (!href) return
    const slug = href.replace(/^\//, '')
    const data = previews[slug]
    if (!data) return

    const rect = link.getBoundingClientRect()
    const isAbove = rect.top > 200
    setAbove(isAbove)
    setPosition({
      top: isAbove ? rect.top + window.scrollY - 8 : rect.bottom + window.scrollY + 8,
      left: Math.min(Math.max(rect.left + window.scrollX + rect.width / 2, 160), window.innerWidth - 160),
    })
    setPreview(data)
    setSlug(slug)
    setWalked(slug in getVisited())
    setFading(false)
    setVisible(true)
  }, [previews])

  const hide = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    setFading(true)
    fadeRef.current = setTimeout(() => { setVisible(false); setFading(false); setPreview(null) }, 150)
  }, [])

  useEffect(() => {
    const links = document.querySelectorAll<HTMLElement>('.internal-link')
    const enter = (e: Event) => {
      if (fadeRef.current) { clearTimeout(fadeRef.current); fadeRef.current = null }
      // Capture the link now — e.currentTarget is only set during dispatch
      // and is null by the time the hover-intent timeout fires.
      const link = e.currentTarget as HTMLElement
      timeoutRef.current = setTimeout(() => show(link), 300)
    }
    const leave = () => hide()

    links.forEach((l) => { l.addEventListener('mouseenter', enter); l.addEventListener('mouseleave', leave) })
    return () => {
      links.forEach((l) => { l.removeEventListener('mouseenter', enter); l.removeEventListener('mouseleave', leave) })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (fadeRef.current) clearTimeout(fadeRef.current)
    }
  }, [show, hide])

  useEffect(() => {
    if (!portalRef.current) {
      let el = document.getElementById('link-preview-portal') as HTMLDivElement
      if (!el) { el = document.createElement('div'); el.id = 'link-preview-portal'; document.body.appendChild(el) }
      portalRef.current = el
    }
  }, [])

  if (!visible || !preview || !portalRef.current) return null

  return createPortal(
    <div
      role="tooltip"
      className={`max-w-xs rounded-lg p-4 transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{
        position: 'absolute', top: position.top, left: position.left, zIndex: 50, pointerEvents: 'none',
        transform: above ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        background: 'var(--color-background-surface)', border: '1px solid var(--color-border-emphasized)',
      }}
    >
      <div className="mb-1 flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0" aria-hidden>
          <PlantGlyph slug={slug} stage={preview.stage} linkCount={preview.linkCount} size={28} />
        </span>
        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{preview.title}</p>
      </div>
      <p className="mb-2 text-sm leading-snug line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>{preview.excerpt}</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {preview.tags.map((tag) => (
          <span key={tag} className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--color-background-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {stageLabels[preview.stage]}
          {preview.planted && ` · planted ${preview.planted}`}
          {walked && ' · you’ve been here'}
        </span>
        <span>{preview.readingTime}</span>
      </div>
    </div>,
    portalRef.current
  )
}
