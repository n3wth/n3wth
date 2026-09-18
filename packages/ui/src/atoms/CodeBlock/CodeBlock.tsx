'use client'

import { CodeBlock as AstryxCodeBlock } from '@astryxdesign/core/CodeBlock'
import { cn } from '../../utils/cn'

export interface CodeBlockProps {
  /** Code string to display */
  code: string
  /** Programming language for syntax highlighting */
  language?: string
  /** Native Astryx code density. */
  size?: 'sm' | 'md'
  /** Show line numbers */
  showLineNumbers?: boolean
  showCopyButton?: boolean
  showLanguageLabel?: boolean
  /** Wrap long lines while preserving the original text for copying. */
  isWrapped?: boolean
  /** Runs only after clipboard writing succeeds. */
  onCopy?: () => void
  /** Additional class names */
  className?: string
}

export function CodeBlock({ code, language = 'javascript', size = 'md', showLineNumbers = false, showCopyButton = false, showLanguageLabel = false, isWrapped = false, onCopy, className }: CodeBlockProps) {
  return <AstryxCodeBlock code={code} language={language} size={size} hasLineNumbers={showLineNumbers} hasLanguageLabel={showLanguageLabel} hasCopyButton={showCopyButton} isWrapped={isWrapped} onCopy={onCopy} highlightMode="spans" width="100%" className={cn('n3wth-code-block', className)} />
}
