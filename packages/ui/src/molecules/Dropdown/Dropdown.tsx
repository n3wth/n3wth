import { forwardRef, useState, useRef, useId, createContext, useContext, type ReactNode, type HTMLAttributes, type Ref } from 'react'
import { Selector } from '@astryxdesign/core/Selector'
import { MultiSelector } from '@astryxdesign/core/MultiSelector'
import { usePopover, type UsePopoverReturn } from '@astryxdesign/core/Popover'
import { useListFocus } from '@astryxdesign/core/hooks'

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DropdownProps {
  /** Options to display */
  options: DropdownOption[]
  /** Controlled value (single-select) */
  value?: string
  /** Controlled values (multi-select) */
  values?: string[]
  /** Default value for uncontrolled single-select */
  defaultValue?: string
  /** Default values for uncontrolled multi-select */
  defaultValues?: string[]
  /** Called when selection changes (single-select) */
  onChange?: (value: string) => void
  /** Called when selection changes (multi-select) */
  onMultiChange?: (values: string[]) => void
  /** Enable multi-select mode */
  multi?: boolean
  /** Enable search/filter input */
  searchable?: boolean
  /** Placeholder text when nothing is selected */
  placeholder?: string
  /** Search input placeholder */
  searchPlaceholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Visual variant */
  variant?: 'default' | 'glass'
  /** Additional class names for the trigger */
  className?: string
  /** Additional class names for the menu */
  menuClassName?: string
  /** Use portal rendering for overflow contexts */
  portal?: boolean
  /** Children for compound API (overrides options-based rendering) */
  children?: ReactNode
}


function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}
interface DropdownContextValue {
  popover: UsePopoverReturn
  triggerRef: React.RefObject<HTMLButtonElement | null>
  id: string
  disabled: boolean
  multi: boolean
  selected: string[]
  select: (value: string) => void
}
const DropdownContext = createContext<DropdownContextValue | null>(null)
function useDropdownContext() {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('Dropdown compound components must be used within <Dropdown>')
  return context
}

export interface DropdownTriggerProps extends HTMLAttributes<HTMLButtonElement> { children?: ReactNode }
export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(({ children, onClick, onKeyDown, ...props }, ref) => {
  const { popover, triggerRef, id, disabled } = useDropdownContext()
  return <button {...props} ref={node => { triggerRef.current = node; popover.triggerRef(node); assignRef(ref, node) }}
    type="button" role="combobox" aria-label={props['aria-label'] ?? (typeof children === 'string' ? children : undefined)} disabled={disabled} aria-expanded={popover.isOpen}
    aria-haspopup="listbox" aria-controls={popover.isOpen ? id : undefined}
    onClick={event => { onClick?.(event); if (!event.defaultPrevented) popover.toggle() }}
    onKeyDown={event => {
      onKeyDown?.(event)
      if (!event.defaultPrevented && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        popover.show()
      }
    }}>{children}</button>
})
DropdownTrigger.displayName = 'Dropdown.Trigger'

export interface DropdownMenuProps extends HTMLAttributes<HTMLUListElement> { children?: ReactNode }
export const DropdownMenu = forwardRef<HTMLUListElement, DropdownMenuProps>(({ children, onKeyDown, ...props }, ref) => {
  const { popover, id, multi } = useDropdownContext()
  const { listRef, handleKeyDown } = useListFocus<HTMLUListElement>({ itemSelector: '[role="option"]:not([aria-disabled="true"])', onEscape: popover.hide })
  return popover.render(<ul {...props} ref={node => { listRef.current = node; assignRef(ref, node) }}
    id={id} role="listbox" aria-multiselectable={multi || undefined}
    onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented) handleKeyDown(event) }}
  >{children}</ul>, { placement: 'below', alignment: 'start' })
})
DropdownMenu.displayName = 'Dropdown.Menu'

export interface DropdownItemProps extends HTMLAttributes<HTMLLIElement> { value: string; disabled?: boolean; children?: ReactNode }
export const DropdownItem = forwardRef<HTMLLIElement, DropdownItemProps>(({ value, disabled = false, children, onClick, onKeyDown, ...props }, ref) => {
  const { selected, select } = useDropdownContext()
  return <li {...props} ref={ref} role="option" tabIndex={disabled ? -1 : 0}
    aria-selected={selected.includes(value)} aria-disabled={disabled || undefined}
    onClick={event => { onClick?.(event); if (!event.defaultPrevented && !disabled) select(value) }}
    onKeyDown={event => {
      onKeyDown?.(event)
      if (!event.defaultPrevented && !disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        select(value)
      }
    }}>{children ?? value}</li>
})
DropdownItem.displayName = 'Dropdown.Item'

/** Arbitrary compound content uses Astryx's layer, light dismissal, focus trap
 * and list navigation instead of implementing a second dropdown system. */
function CompoundDropdown({ children, multi = false, value, values, defaultValue, defaultValues, onChange, onMultiChange, disabled = false, className, forwardedRef }: DropdownProps & { forwardedRef: Ref<HTMLDivElement> }) {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const id = useId()
  const [internal, setInternal] = useState(defaultValues ?? (defaultValue ? [defaultValue] : []))
  const selected = multi ? values ?? internal : value !== undefined ? [value] : internal
  const popover = usePopover({ role: 'none', hasCloseButton: false, onHide: () => triggerRef.current?.focus() })
  const select = (nextValue: string) => {
    const next = multi ? selected.includes(nextValue) ? selected.filter(item => item !== nextValue) : [...selected, nextValue] : [nextValue]
    if (multi ? values === undefined : value === undefined) setInternal(next)
    if (multi) onMultiChange?.(next)
    else { onChange?.(nextValue); popover.hide() }
  }
  return <DropdownContext.Provider value={{ popover, triggerRef, id, disabled, multi, selected, select }}>
    <div ref={forwardedRef} className={className}>{children}</div>
  </DropdownContext.Provider>
}

export const Dropdown = Object.assign(forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
  const { options, value, values, defaultValue, defaultValues, onChange, onMultiChange, multi = false,
    searchable = false, placeholder = 'Select...', searchPlaceholder, disabled = false, size = 'md',
    className, children } = props
  const [single, setSingle] = useState(defaultValue ?? '')
  const [multiple, setMultiple] = useState(defaultValues ?? [])
  if (children != null) return <CompoundDropdown {...props} forwardedRef={ref} />
  // Legacy portal/menuClassName are accepted for source compatibility; Astryx
  // owns top-layer rendering and menu styling. lg maps to its largest md size.
  const common = { options, label: placeholder, isLabelHidden: true, placeholder,
    hasSearch: searchable, searchPlaceholder, isDisabled: disabled, size: size === 'sm' ? 'sm' as const : 'md' as const, width: '100%' }
  return <div ref={ref} className={className}>
    {multi ? <MultiSelector {...common} value={values ?? multiple} onChange={next => {
      if (values === undefined) setMultiple(next)
      onMultiChange?.(next)
    }} /> : <Selector {...common} value={value ?? single} onChange={next => {
      if (value === undefined) setSingle(next)
      onChange?.(next)
    }} />}
  </div>
}), { Trigger: DropdownTrigger, Menu: DropdownMenu, Item: DropdownItem })
Dropdown.displayName = 'Dropdown'
