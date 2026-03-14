import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from '../lib/gsap'

interface Nudge {
  message: string
  cta?: string
  target?: string
}

const NUDGES: Record<string, Nudge[]> = {
  work: [
    {
      message: 'Oliver shipped trust infrastructure at Google and navigated an Amazon acquisition at Covariant.',
      cta: 'See what he builds on the side',
      target: '#building',
    },
  ],
  building: [
    {
      message: 'These tools reflect a thesis: AI should collaborate, not just respond.',
      cta: 'Read the argument',
      target: '#thinking',
    },
  ],
  thinking: [
    {
      message: 'Trust as a runtime property drove 99.9% uptime at Covariant and shapes his work at Google.',
      cta: 'See the track record',
      target: '#work',
    },
  ],
  frameworks: [
    {
      message: 'These principles come from shipping at Google, Meta, Microsoft, and Covariant.',
      cta: 'See the creative side',
      target: '#creative',
    },
  ],
  creative: [
    {
      message: '70,000 people experienced THEM at Burning Man. The same systems thinking applies to billion-user products.',
    },
  ],
  contact: [
    {
      message: 'AI safety, ambient agents, or LED art. Oliver is usually up for a conversation.',
    },
  ],
  _explored: [
    {
      message: 'You have seen the work. The real question is what Oliver is building next.',
      cta: 'Get in touch',
      target: '#contact',
    },
  ],
}

export function AmbientAgent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentNudge, setCurrentNudge] = useState<Nudge | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [askMode, setAskMode] = useState(false)
  const [query, setQuery] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState('')
  const sectionsViewed = useRef(new Set<string>())
  const nudgesShown = useRef(new Set<string>())
  const timerRef = useRef<ReturnType<typeof setTimeout>>(0 as unknown as ReturnType<typeof setTimeout>)

  const showNudge = useCallback((nudge: Nudge) => {
    if (dismissed || askMode) return
    const key = nudge.message
    if (nudgesShown.current.has(key)) return
    nudgesShown.current.add(key)

    setCurrentNudge(nudge)
    setReply('')
    setVisible(true)

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!askMode) setVisible(false)
    }, 8000)
  }, [dismissed, askMode])

  const dismiss = useCallback(() => {
    setVisible(false)
    setAskMode(false)
    setReply('')
    setQuery('')
    clearTimeout(timerRef.current)
  }, [])

  const navigate = useCallback((target: string) => {
    dismiss()
    const el = document.querySelector(target)
    el?.scrollIntoView({ behavior: 'smooth' })
  }, [dismiss])

  const dismissPermanently = useCallback(() => {
    setDismissed(true)
    setVisible(false)
    setAskMode(false)
    clearTimeout(timerRef.current)
  }, [])

  const openAsk = useCallback(() => {
    clearTimeout(timerRef.current)
    setAskMode(true)
    setCurrentNudge(null)
    setReply('')
    setVisible(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const askAgent = useCallback(async () => {
    if (!query.trim() || loading) return
    setLoading(true)
    setReply('')

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query.trim(), context: currentSection }),
      })
      const data = await res.json()
      setReply(data.reply || data.error || 'No response.')
    } catch {
      setReply('Agent unavailable right now.')
    } finally {
      setLoading(false)
      setQuery('')
    }
  }, [query, loading, currentSection])

  // Track sections in view
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const sections = document.querySelectorAll('section[id]')
    const observers: IntersectionObserver[] = []

    sections.forEach((section) => {
      const id = section.id
      let dwellTimer: ReturnType<typeof setTimeout>

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentSection(id)
            dwellTimer = setTimeout(() => {
              sectionsViewed.current.add(id)

              if (sectionsViewed.current.size >= 4) {
                const explored = NUDGES._explored
                if (explored?.[0]) { showNudge(explored[0]); return }
              }

              const sectionNudges = NUDGES[id]
              if (sectionNudges?.[0]) showNudge(sectionNudges[0])
            }, 3500)
          } else {
            clearTimeout(dwellTimer)
          }
        },
        { threshold: 0.4 }
      )

      observer.observe(section)
      observers.push(observer)
    })

    return () => {
      observers.forEach((o) => o.disconnect())
      clearTimeout(timerRef.current)
    }
  }, [showNudge])

  // Animate in/out
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (visible) {
      gsap.fromTo(container,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
      )
    } else {
      gsap.to(container, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' })
    }
  }, [visible, askMode, currentNudge, reply])

  if (dismissed) return null

  return (
    <>
      {/* Persistent agent dot -- click to open ask mode */}
      {!visible && (
        <button
          onClick={openAsk}
          className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2 px-3 py-2 rounded-full transition-colors"
          style={{
            background: 'rgba(15, 15, 15, 0.8)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          aria-label="Ask the agent"
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: '#5DADE2', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#5DADE2' }} />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-grey-400)' }}>
            Agent
          </span>
        </button>
      )}

      {/* Agent panel */}
      <div
        ref={containerRef}
        className="fixed bottom-6 right-6 z-[9990] w-80 opacity-0"
        style={{ willChange: 'transform, opacity' }}
        role="status"
        aria-live="polite"
      >
        <div
          className="relative rounded-xl p-4 sm:p-5"
          style={{
            background: 'rgba(15, 15, 15, 0.95)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: '#5DADE2', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#5DADE2' }} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-grey-400)' }}>
              Agent
            </span>
            <button
              onClick={dismissPermanently}
              className="ml-auto text-[11px] font-mono uppercase tracking-wider transition-colors hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: 'var(--color-grey-600)' }}
              aria-label="Mute agent permanently"
            >
              Mute
            </button>
          </div>

          {/* Nudge mode */}
          {currentNudge && !askMode && (
            <>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-grey-200)' }}>
                {currentNudge.message}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {currentNudge.cta && currentNudge.target && (
                  <button
                    onClick={() => navigate(currentNudge.target!)}
                    className="text-xs font-mono uppercase tracking-wider transition-colors hover:text-white"
                    style={{ color: '#5DADE2' }}
                  >
                    {currentNudge.cta} &rarr;
                  </button>
                )}
                <button
                  onClick={openAsk}
                  className="text-xs font-mono uppercase tracking-wider transition-colors hover:text-white"
                  style={{ color: 'var(--color-grey-500)' }}
                >
                  Ask me anything
                </button>
                <button
                  onClick={dismiss}
                  className="text-xs font-mono uppercase tracking-wider transition-colors hover:text-white ml-auto"
                  style={{ color: 'var(--color-grey-600)' }}
                >
                  Dismiss
                </button>
              </div>
            </>
          )}

          {/* Ask mode */}
          {askMode && (
            <>
              {reply && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-grey-200)' }}>
                  {reply}
                </p>
              )}
              {!reply && !loading && (
                <p className="text-xs mb-3" style={{ color: 'var(--color-grey-500)' }}>
                  Ask anything about Oliver's work, projects, or beliefs.
                </p>
              )}
              {loading && (
                <p className="text-xs mb-3" style={{ color: 'var(--color-grey-500)' }}>
                  Thinking...
                </p>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); askAgent() }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask the agent..."
                  maxLength={500}
                  disabled={loading}
                  className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--color-grey-600)] focus:outline-none focus:border-[#5DADE2] disabled:opacity-50"
                  style={{ borderColor: 'var(--glass-border)' }}
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="text-xs font-mono uppercase tracking-wider px-3 py-2 rounded-lg transition-colors hover:text-white disabled:opacity-30"
                  style={{ color: '#5DADE2', border: '1px solid var(--glass-border)' }}
                >
                  Ask
                </button>
              </form>
              <button
                onClick={dismiss}
                className="mt-2 text-[11px] font-mono uppercase tracking-wider transition-colors hover:text-white"
                style={{ color: 'var(--color-grey-600)' }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
