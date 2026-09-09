import { CodeBlock as AstryxCodeBlock } from '@astryxdesign/core/CodeBlock'

export interface CodeBlockProps {
  /** Code string to display */
  code: string
  /** Programming language for syntax highlighting */
  language?: 'javascript' | 'typescript' | 'json' | 'bash' | 'css'
  /** Show line numbers */
  showLineNumbers?: boolean
  /** Additional class names */
  className?: string
}

export function CodeBlock({ code, language = 'javascript', showLineNumbers = false, className }: CodeBlockProps) {
  return <AstryxCodeBlock code={code} language={language} hasLineNumbers={showLineNumbers} hasLanguageLabel={false} hasCopyButton={false} highlightMode="spans" width="100%" className={className} />
}
