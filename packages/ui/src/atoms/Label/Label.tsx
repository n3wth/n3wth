import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react'
import { Text } from '@astryxdesign/core/Text'
import { cn } from '../../utils/cn'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  disabled?: boolean
  children: ReactNode
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      required = false,
      disabled = false,
      children,
      className,
      color,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Text as="label" type="supporting" weight="medium"
        ref={ref}
        style={{ color, ...style }}
        className={cn(
          'text-sm font-medium text-[var(--color-white)]',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-[var(--color-coral)] ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </Text>
    )
  }
)

Label.displayName = 'Label'
