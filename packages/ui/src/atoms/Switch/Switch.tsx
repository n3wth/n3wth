import { forwardRef, useState } from 'react'
import { Switch as AstryxSwitch } from '@astryxdesign/core/Switch'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}


/** The ref targets Astryx's native checkbox input, which implements the switch. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, defaultChecked = false, onChange, disabled = false, size = 'md', label = '', className }, ref) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked)
    const value = checked ?? internalChecked
    return <AstryxSwitch ref={ref} label={label} isLabelHidden value={value} isDisabled={disabled} className={className} data-size={size} style={{ zoom: size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : 1 }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' || disabled) return
        event.preventDefault()
        const next = !value
        if (checked === undefined) setInternalChecked(next)
        onChange?.(next)
      }}
      onChange={(next) => { if (checked === undefined) setInternalChecked(next); onChange?.(next) }}
    />
  }
)
Switch.displayName = 'Switch'
