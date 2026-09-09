import { forwardRef, type ReactNode } from 'react'
import { Tooltip as AstryxTooltip } from '@astryxdesign/core/Tooltip'

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipProps {
  /** Content to display inside the tooltip */
  content: ReactNode
  /** The element that triggers the tooltip */
  children: ReactNode
  /** Preferred position of the tooltip relative to the trigger */
  position?: TooltipPosition
  /** Delay in ms before showing the tooltip */
  showDelay?: number
  /** Delay in ms before hiding the tooltip */
  hideDelay?: number
  /** Whether the tooltip is disabled */
  disabled?: boolean
  /** @deprecated Astryx owns popup presentation; the compatibility prop is retained. */
  arrow?: boolean
  /** Additional class names for the tooltip popup */
  className?: string
}


const placements = { top: 'above', bottom: 'below', left: 'start', right: 'end' } as const

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, position = 'top', showDelay = 200, hideDelay = 0, disabled = false, arrow = true, className }, ref) => (
    <div ref={ref} className="inline-flex">
      <AstryxTooltip content={<span className={className} data-arrow={arrow}>{content}</span>} placement={placements[position]} delay={showDelay} hideDelay={hideDelay} isEnabled={!disabled} focusTrigger="always" hasHoverIndication={false}>
        {children}
      </AstryxTooltip>
    </div>
  )
)
Tooltip.displayName = 'Tooltip'
