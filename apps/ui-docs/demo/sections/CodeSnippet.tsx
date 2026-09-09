import { CodeBlock, type CodeBlockProps } from '@n3wth/ui'

export type CodeSnippetProps = Pick<CodeBlockProps, 'code' | 'language' | 'showLineNumbers' | 'className'>

export function CodeSnippet({ className, ...props }: CodeSnippetProps) {
  return <div className={className}><CodeBlock {...props} showCopyButton /></div>
}
