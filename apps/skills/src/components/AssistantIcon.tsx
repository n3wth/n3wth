import type { AssistantId } from '../config/assistants'

interface AssistantIconProps {
  assistant: AssistantId
  size?: number
  className?: string
}

export function AssistantIcon({ assistant, size = 16, className = '' }: AssistantIconProps) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    className,
  }

  switch (assistant) {
    case 'gemini':
      // Google Gemini sparkle icon
      return (
        <svg {...iconProps}>
          <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
        </svg>
      )
    case 'claude':
      // Anthropic Claude icon (spark/sunburst)
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" />
        </svg>
      )
    case 'cursor':
      // Cursor arrow/pointer icon
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.89 0 1.33-1.08.7-1.71L6.21 2.51c-.63-.63-1.71-.18-1.71.7z" />
        </svg>
      )
    case 'windsurf':
      // Windsurf/Codeium logo (stylized wave/sail)
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M4 20L20 4M4 20C4 20 8 16 12 16C16 16 20 12 20 8M4 20C4 16 6 12 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'copilot':
      // GitHub Copilot icon (dual lens visor)
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm6 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
        </svg>
      )
    default:
      return null
  }
}
