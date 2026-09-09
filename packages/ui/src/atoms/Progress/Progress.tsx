import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  label?: string
  showValue?: boolean
  className?: string
}


export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, size = 'md', variant = 'default', label = '', showValue = false, className, ...props }, ref) => (
    <ProgressBar ref={ref} value={value} max={max} label={label} isLabelHidden hasValueLabel={showValue} variant={variant === 'default' ? 'neutral' : variant} className={cn(size === 'sm' ? '[&_.astryx-progressbar-track]:h-1.5' : size === 'lg' ? '[&_.astryx-progressbar-track]:h-3' : '[&_.astryx-progressbar-track]:h-2', className)} data-size={size} {...props} />
  )
)
Progress.displayName = 'Progress'
