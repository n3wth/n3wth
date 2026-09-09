import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { Field } from '@astryxdesign/core/Field'
import { cn } from '../../utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: 'none' | 'vertical' | 'both'
  error?: boolean
  className?: string
}

// Keep the native control inside Astryx Field: TextArea 0.1.6 replaces supplied
// ids and controls its string value, breaking external labels and form reset.
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      resize = 'vertical',
      error = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      both: 'resize',
    }

    return (
      <Field label="" inputID={inputId} isLabelHidden>
      <textarea
        id={inputId}
        ref={ref}
        className={cn(
          'min-h-[80px] w-full',
          'bg-transparent',
          'border rounded-lg px-3 py-2',
          'text-sm text-[var(--color-white)]',
          'placeholder:text-[var(--color-grey-400)]',
          'transition-[border-color] duration-200 ease-out',
          'focus:outline-none focus-visible:outline-none',
          'focus-ring',
          error
            ? 'border-[var(--color-coral)]'
            : 'border-[var(--glass-border)] hover:border-[var(--glass-highlight)] focus:border-[var(--glass-highlight)]',
          resizeStyles[resize],
          className
        )}
        aria-invalid={error || undefined}
        {...props}
      />
      </Field>
    )
  }
)

Textarea.displayName = 'Textarea'
