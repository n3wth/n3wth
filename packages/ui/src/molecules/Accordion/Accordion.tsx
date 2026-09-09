import {
  forwardRef,
  createContext,
  useContext,
  useState,
  useId,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { CollapsibleGroup, useCollapsible } from '@astryxdesign/core/Collapsible'
import { useListFocus } from '@astryxdesign/core/hooks'
import { cn } from '../../utils/cn'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// --- Contexts ---

interface AccordionContextValue {
  type: 'single' | 'multiple'
  collapsible: boolean
  baseId: string
}

interface AccordionItemContextValue {
  value: string
  disabled: boolean
  isOpen: boolean
  toggle: () => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null)

function useAccordionContext() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion compound components must be used within an <Accordion> parent')
  }
  return context
}

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error('AccordionTrigger/AccordionContent must be used within an <AccordionItem> parent')
  }
  return context
}

// --- Accordion Root ---

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Whether only one or multiple items can be open */
  type?: 'single' | 'multiple'
  /** Controlled open values */
  value?: string[]
  /** Default open values for uncontrolled mode */
  defaultValue?: string[]
  /** Callback when open values change */
  onChange?: (value: string[]) => void
  /** In single mode, allows closing the open item */
  collapsible?: boolean
  children: ReactNode
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = 'single',
      value,
      defaultValue = [],
      onChange,
      collapsible = false,
      children,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue)
    const { listRef, handleKeyDown } = useListFocus<HTMLDivElement>({ itemSelector: 'button[aria-expanded]:not([aria-disabled="true"])' })
    const baseId = useId()

    const openValues = value !== undefined ? value : internalValue

    const handleChange = (nextValue: string | string[]) => {
      const next = Array.isArray(nextValue) ? nextValue : nextValue ? [nextValue] : []
      if (type === 'single' && !collapsible && next.length === 0 && openValues.length > 0) return
      if (value === undefined) setInternalValue(next)
      onChange?.(next)
    }

    return (
      <AccordionContext.Provider
        value={{ type, collapsible, baseId }}
      >
        <CollapsibleGroup type={type} value={openValues} onChange={handleChange}>
        <div
          ref={node => { listRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node }}
          onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && event.key !== 'Escape') handleKeyDown(event) }}
          className={cn('flex flex-col divide-y divide-[var(--glass-border)]', className)}
          {...props}
        >
          {children}
        </div>
        </CollapsibleGroup>
      </AccordionContext.Provider>
    )
  }
)

Accordion.displayName = 'Accordion'

// --- AccordionItem ---

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique identifier for this item */
  value: string
  /** Whether this item is disabled */
  disabled?: boolean
  children: ReactNode
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, children, className, ...props }, ref) => {
    useAccordionContext()
    const { isOpen, toggle } = useCollapsible({ isCollapsible: true, value })

    return (
      <AccordionItemContext.Provider value={{ value, disabled, isOpen, toggle }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)

AccordionItem.displayName = 'AccordionItem'

// --- AccordionTrigger ---

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, onKeyDown, ...props }, ref) => {
    const { baseId } = useAccordionContext()
    const { value, disabled, isOpen, toggle } = useAccordionItemContext()
    const prefersReducedMotion = useReducedMotion()

    const triggerId = `${baseId}-trigger-${value}`
    const contentId = `${baseId}-content-${value}`

    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) toggle()
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center justify-between',
          'py-3 text-sm font-medium text-[var(--color-white)]',
          'hover:text-[var(--color-grey-300)]',
          'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed hover:text-[var(--color-white)]',
          className
        )}
        {...props}
      >
        {children}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            'shrink-0',
            prefersReducedMotion ? 'transition-none' : 'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
    )
  }
)

AccordionTrigger.displayName = 'AccordionTrigger'

// --- AccordionContent ---

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, ref) => {
    const { baseId } = useAccordionContext()
    const { value, isOpen } = useAccordionItemContext()
    const prefersReducedMotion = useReducedMotion()

    const triggerId = `${baseId}-trigger-${value}`
    const contentId = `${baseId}-content-${value}`

    return (
      <div
        ref={ref}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          'grid',
          prefersReducedMotion
            ? 'transition-none'
            : 'transition-[grid-template-rows] duration-200 ease-out',
          isOpen ? 'grid-template-rows-open' : 'grid-template-rows-closed'
        )}
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
        }}
        {...props}
      >
        <div className="overflow-hidden">
          <div className={cn('pb-3 text-sm text-[var(--color-grey-400)]', className)}>
            {children}
          </div>
        </div>
      </div>
    )
  }
)

AccordionContent.displayName = 'AccordionContent'
