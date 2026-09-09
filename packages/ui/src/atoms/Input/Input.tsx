import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { Field } from '@astryxdesign/core/Field'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass'
  inputSize?: 'sm' | 'md' | 'lg'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /** Error state - boolean for styling only, or string to display error message */
  error?: boolean | string
  /** Associated label id for accessibility */
  labelId?: string
}

// TextInput 0.1.6 generates its own id and limits input types. Astryx Field
// supplies field layout while the native control preserves external labels,
// browser input types, uncontrolled values, form reset, refs and native events.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      leftIcon,
      rightIcon,
      error = false,
      labelId,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const hasError = Boolean(error)
    const errorMessage = typeof error === 'string' ? error : undefined
    const errorId = errorMessage ? `${inputId}-error` : undefined
    const wrapperStyles = [
      'relative inline-flex items-center w-full',
      'border rounded-xl',
      'transition-[border-color,background-color,box-shadow] duration-200',
      'focus-within:border-[var(--color-white)]',
      'focus-within:outline-2 focus-within:outline-[var(--color-text-primary)] focus-within:outline-offset-2',
    ]

    const variants = {
      default: [
        'bg-transparent',
        hasError ? 'border-[var(--color-coral)]' : 'border-[var(--glass-border)]',
        'hover:border-[var(--glass-highlight)]',
      ],
      glass: [
        'bg-[var(--glass-bg)]',
        hasError ? 'border-[var(--color-coral)]' : 'border-[var(--glass-border)]',
        'hover:bg-[rgba(255,255,255,0.08)]',
      ],
    }

    const sizes = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
    }

    const inputSizes = {
      sm: 'text-xs px-3',
      md: 'text-sm px-4',
      lg: 'text-base px-5',
    }

    const iconPadding = {
      sm: { left: 'pl-8', right: 'pr-8' },
      md: { left: 'pl-10', right: 'pr-10' },
      lg: { left: 'pl-12', right: 'pr-12' },
    }

    return (
      <Field label="" inputID={inputId} isLabelHidden className="flex flex-col gap-1.5">
        <div className={cn(wrapperStyles, variants[variant], sizes[inputSize], className)}>
          {leftIcon && (
            <span className="absolute left-3 text-[var(--color-grey-400)] pointer-events-none" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-full bg-transparent',
              'text-[var(--color-white)]',
              'placeholder:text-[var(--color-grey-600)]',
              'focus:outline-none focus-visible:outline-none',
              inputSizes[inputSize],
              leftIcon && iconPadding[inputSize].left,
              rightIcon && iconPadding[inputSize].right
            )}
            aria-invalid={hasError || undefined}
            aria-describedby={errorId}
            aria-labelledby={labelId}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--color-grey-400)]" aria-hidden="true">{rightIcon}</span>
          )}
        </div>
        {errorMessage && (
          <span id={errorId} className="text-xs text-[var(--color-coral)]" role="alert">
            {errorMessage}
          </span>
        )}
      </Field>
    )
  }
)

Input.displayName = 'Input'
