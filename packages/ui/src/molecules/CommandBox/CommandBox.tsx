import { type HTMLAttributes } from 'react'
import { CodeBlock } from '../../atoms/CodeBlock'

export interface CommandBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  command: string
  /** Retained for compatibility; commands share one flat treatment. */
  variant?: 'default' | 'primary'
  showCopyButton?: boolean
  onCopy?: () => void
}

export function CommandBox({ command, variant = 'default', showCopyButton = true, onCopy, style, ...props }: CommandBoxProps) {
  return (
    <div {...props} data-variant={variant} style={{ minWidth: 0, width: '100%', maxWidth: '100%', ...style }}>
      <CodeBlock code={command} language="bash" showCopyButton={showCopyButton} onCopy={onCopy} />
    </div>
  )
}
