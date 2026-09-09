import type { AssistantId } from '../config/assistants'

interface AssistantIconProps {
  assistant: AssistantId
  size?: number
  className?: string
}

export function AssistantIcon({ assistant, size = 16, className = '' }: AssistantIconProps) {
  if (assistant !== 'gemini') return null

  return (
    <span
      role="img"
      aria-label="Google Gemini"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, fontSize: size, fontWeight: 600, lineHeight: 1 }}
    >
      G
    </span>
  )
}
