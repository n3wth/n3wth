import { forwardRef, useEffect, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Toast as AstryxToast } from '@astryxdesign/core/Toast'
import { cn } from '../../utils/cn'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface ToastData {
  id: string
  variant: ToastVariant
  title?: string
  description?: string
  duration?: number
  icon?: ReactNode
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: ToastVariant
  title?: string
  description?: string
  duration?: number
  icon?: ReactNode
  onDismiss?: () => void
  open?: boolean
}


/** Astryx owns dismissal timing, hover/focus pause, live announcements and close control. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(({
  variant = 'default', title, description, duration = 5000, icon,
  onDismiss, open = true, className, ...props
}, ref) => {
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => { if (open) setDismissed(false) }, [open])
  if (!open || dismissed) return null
  return <div ref={ref} className={cn('pointer-events-auto', className)} {...props}>
    <AstryxToast
      type={variant === 'error' ? 'error' : 'info'}
      isAutoHide={duration > 0}
      autoHideDuration={duration}
      onDismiss={() => { setDismissed(true); onDismiss?.() }}
      body={<div className="flex items-start gap-3">
        {icon}
        <div>{title && <p className="font-medium">{title}</p>}{description && <p>{description}</p>}</div>
      </div>}
    />
  </div>
})
Toast.displayName = 'Toast'

export interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition
  children?: ReactNode
}

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-0 right-0 items-end',
  'top-left': 'top-0 left-0 items-start',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-0 right-0 items-end',
  'bottom-left': 'bottom-0 left-0 items-start',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
}

export function ToastContainer({
  position = 'top-right',
  children,
  className,
  ...props
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed z-50',
        'flex flex-col gap-3',
        'p-4',
        'pointer-events-none',
        positionStyles[position],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
