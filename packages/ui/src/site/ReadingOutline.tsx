'use client'

import { useId } from 'react'
import { Outline, useCollapsible, type OutlineItem } from '@astryxdesign/core'
import { cn } from '../utils/cn'

export interface ReadingOutlineProps {
  items: OutlineItem[]
  label?: string
  collapsible?: boolean
  className?: string
}

/** Quiet article navigation, with Astryx owning scroll-spy and disclosure state. */
export function ReadingOutline({ items, label = 'On this page', collapsible = false, className }: ReadingOutlineProps) {
  const id = useId()
  const { isOpen, toggle } = useCollapsible({ isCollapsible: { defaultIsOpen: false } })
  return (
    <div className={cn('n3wth-site-reading-outline', className)}>
      {collapsible ? (
        <button className="n3wth-site-reading-outline-label" type="button" aria-expanded={isOpen} aria-controls={id} onClick={toggle}>
          {label}<span aria-hidden="true">{isOpen ? '−' : '+'}</span>
        </button>
      ) : <p className="n3wth-site-reading-outline-label">{label}</p>}
      <div id={id} hidden={collapsible && !isOpen} className="n3wth-site-reading-outline-content">
        <Outline items={items} density="compact" label={label} />
      </div>
    </div>
  )
}
