import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export interface VisualBandProps extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-hidden'> {
  height?: CSSProperties['height']
  fullBleed?: boolean
}

/** Decorative artwork only: keep text and interactive controls outside this band.
 * Layout never depends on scroll observers or entrance-animation state.
 */
export const VisualBand = forwardRef<HTMLDivElement, VisualBandProps>(function VisualBand({
  height = 'clamp(190px, 34svh, 340px)', fullBleed = true, className, style, ...props
}, ref) {
  return <div {...props} ref={ref} aria-hidden="true"
    className={cn('n3wth-visual-band', fullBleed && 'n3wth-visual-band--full', className)}
    style={{ height, ...style }} />
})
