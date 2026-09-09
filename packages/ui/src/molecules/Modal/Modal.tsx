import { forwardRef, createContext, useContext, useId, useState, useEffect, type HTMLAttributes, type ReactNode } from 'react'
import { Dialog } from '@astryxdesign/core/Dialog'
import { cn } from '../../utils/cn'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  ariaLabel?: string
}
const ModalContext = createContext<{ title: string; description: string; setTitleId: (id: string | undefined) => void; setDescriptionId: (id: string | undefined) => void } | null>(null)
const widths = { sm: 400, md: 560, lg: 720, full: '100dvw' } as const

/** Astryx owns the native modal, focus restoration, Escape and scroll lock.
 * The inner div preserves the historical forwarded-ref and content attributes.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(({
  isOpen, onClose, children, size = 'md', closeOnBackdropClick = true,
  closeOnEscape = true, ariaLabel, className, ...props
}, ref) => {
  const title = useId()
  const description = useId()
  const [titleId, setTitleId] = useState<string>()
  const [descriptionId, setDescriptionId] = useState<string>()
  return (
    <ModalContext.Provider value={{ title, description, setTitleId, setDescriptionId }}>
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => { if (!open) onClose() }}
        purpose={closeOnEscape ? 'form' : 'required'}
        role="dialog"
        variant={size === 'full' ? 'fullscreen' : 'standard'}
        width={widths[size]}
        padding={0}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-describedby={descriptionId}
        onClick={event => {
          if (closeOnBackdropClick && event.target === event.currentTarget) onClose()
        }}
      >
        <div ref={ref} className={className} {...props}>{isOpen ? children : null}</div>
      </Dialog>
    </ModalContext.Provider>
  )
})
Modal.displayName = 'Modal'

// --- Compound sub-components ---

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function ModalHeader({ children, className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 pt-6 pb-0',
        'flex items-start justify-between gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

ModalHeader.displayName = 'ModalHeader'

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export function ModalTitle({ children, as: Tag = 'h2', className, id, ...props }: ModalTitleProps) {
  const ids = useContext(ModalContext)
  const labelId = id ?? ids?.title
  const register = ids?.setTitleId
  useEffect(() => { register?.(labelId); return () => register?.(undefined) }, [labelId, register])
  return (
    <Tag
      id={labelId}
      className={cn(
        'font-display text-lg font-semibold text-[var(--color-white)]',
        'tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

ModalTitle.displayName = 'ModalTitle'

export interface ModalDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

export function ModalDescription({ children, className, id, ...props }: ModalDescriptionProps) {
  const ids = useContext(ModalContext)
  const descriptionId = id ?? ids?.description
  const register = ids?.setDescriptionId
  useEffect(() => { register?.(descriptionId); return () => register?.(undefined) }, [descriptionId, register])
  return (
    <p
      id={descriptionId}
      className={cn(
        'text-sm text-[var(--color-grey-400)]',
        'mt-1',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

ModalDescription.displayName = 'ModalDescription'

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function ModalBody({ children, className, ...props }: ModalBodyProps) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        'overflow-y-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

ModalBody.displayName = 'ModalBody'

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function ModalFooter({ children, className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'px-6 pb-6 pt-0',
        'border-t border-[var(--glass-border)]',
        'mt-2 pt-4',
        'flex items-center justify-end gap-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

ModalFooter.displayName = 'ModalFooter'

export interface ModalCloseButtonProps extends HTMLAttributes<HTMLButtonElement> {
  /** Accessible label for the close button */
  ariaLabel?: string
}

export function ModalCloseButton({
  ariaLabel = 'Close',
  className,
  onClick,
  ...props
}: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center',
        'w-8 h-8 rounded-lg',
        'text-[var(--color-grey-400)]',
        'hover:text-[var(--color-white)] hover:bg-[var(--glass-bg)]',
        'transition-colors duration-200',
        'focus-ring',
        'motion-reduce:transition-none',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  )
}

ModalCloseButton.displayName = 'ModalCloseButton'
