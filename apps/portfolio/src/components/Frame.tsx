import { useEffect, useRef, type ReactNode } from 'react'
import { PageHeader } from '@n3wth/ui/site'
import { SectionStory, type SectionStoryKind } from './SectionStory'
import './sectionHero.css'

/**
 * Section header: a large display headline and an optional lede.
 * Pass as="h1" on a route's first section — every page needs a
 * top-level heading, not an outline that starts at h2.
 */
export function SectionHeader({
  title,
  lede,
  action,
  story,
  as: Heading = 'h2',
}: {
  title: ReactNode
  lede?: ReactNode
  action?: ReactNode
  story?: SectionStoryKind
  as?: 'h1' | 'h2'
}) {
  const scene = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = scene.current
    if (!element || !story || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [story])

  const header = (
    <PageHeader
      className={`site-content-gutter${Heading === 'h1' ? ' portfolio-section-hero' : ''}`}
      spacing={story ? 'compact' : 'default'}
      title={Heading === 'h1' ? <span className="portfolio-section-title">{title}</span> : title}
      description={lede}
      actions={action}
      level={Heading === 'h1' ? 1 : 2}
    />
  )

  if (!story) return header
  return (
    <div className="portfolio-story-hero" ref={scene} data-visible="false">
      <SectionStory kind={story} />
      <div className="portfolio-story-copy">{header}</div>
    </div>
  )
}
