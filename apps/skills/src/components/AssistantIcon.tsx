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
    default:
      return null
  }
}
