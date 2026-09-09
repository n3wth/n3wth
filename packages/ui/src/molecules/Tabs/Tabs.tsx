import { forwardRef, createContext, useContext, useState, useId, type HTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { TabList as AstryxTabList, Tab as AstryxTab } from '@astryxdesign/core/TabList'
import { cn } from '../../utils/cn'

type TabsVariant = 'underline' | 'pill'
const TabsContext = createContext<{ activeValue: string; setActiveValue: (value: string) => void; variant: TabsVariant; baseId: string } | null>(null)
function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tabs compound components must be used within a <Tabs> parent')
  return context
}
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  defaultValue?: string
  variant?: TabsVariant
  children: ReactNode
}
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(({ value, onChange, defaultValue, variant = 'underline', children, className, ...props }, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const baseId = useId()
  const activeValue = value ?? internalValue
  const setActiveValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    if (next !== activeValue) onChange?.(next)
  }
  return <TabsContext.Provider value={{ activeValue, setActiveValue, variant, baseId }}><div ref={ref} className={cn('flex flex-col', className)} {...props}>{children}</div></TabsContext.Provider>
})
Tabs.displayName = 'Tabs'

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> { glass?: boolean; children: ReactNode }
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(({ glass: _glass, children, className, ...props }, ref) => {
  const { activeValue, setActiveValue, variant } = useTabsContext()
  // Astryx owns roving focus and disabled-item skipping; this adapter supplies
  // tab/panel semantics because Astryx also supports navigation-style tab strips.
  return <AstryxTabList {...props} value={activeValue} onChange={setActiveValue} role="tablist" hasDivider={variant === 'underline'} className={cn(variant === 'pill' && 'rounded-full bg-[var(--glass-bg)] p-1', className)} ref={ref}>{children}</AstryxTabList>
})
TabsList.displayName = 'TabsList'

export interface TabsTabProps extends ButtonHTMLAttributes<HTMLButtonElement> { value: string; children: ReactNode }
export const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(({ value, children, onClick, onFocus, ...props }, ref) => {
  const { activeValue, setActiveValue, baseId } = useTabsContext()
  return <AstryxTab
    ref={ref} value={value} label="" endContent={children}
    role="tab" aria-selected={activeValue === value}
    id={`${baseId}-tab-${value}`} aria-controls={`${baseId}-panel-${value}`}
    onClick={event => { onClick?.(event); if (!event.defaultPrevented) setActiveValue(value) }}
    onFocus={event => { onFocus?.(event); if (!event.defaultPrevented && !props.disabled) setActiveValue(value) }}
    {...props}
  />
})
TabsTab.displayName = 'TabsTab'

// --- TabsPanel ---

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** The tab value this panel corresponds to */
  value: string
  children: ReactNode
}

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ value, children, className, ...props }, ref) => {
    const { activeValue, baseId } = useTabsContext()
    const isActive = activeValue === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        tabIndex={0}
        className={cn('mt-2 focus-ring', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsPanel.displayName = 'TabsPanel'
