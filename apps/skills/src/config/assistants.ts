import { getSkillInstallCommand } from './commands'

// AI Assistant configuration for multi-platform support
export type AssistantId = 'gemini'

export interface AIAssistant {
  id: AssistantId
  name: string
  shortName: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  skillsDir: string
  installCommand: (skillId: string, skillFileUrl?: string) => string
  description: string
}

export const assistants: Record<AssistantId, AIAssistant> = {
  gemini: {
    id: 'gemini',
    name: 'Antigravity CLI',
    shortName: 'Antigravity',
    color: '#4285F4',
    bgColor: 'rgba(66, 133, 244, 0.15)',
    borderColor: 'rgba(66, 133, 244, 0.3)',
    icon: 'gemini',
    skillsDir: '~/.gemini/skills',
    installCommand: (skillId: string, skillFileUrl?: string) =>
      getSkillInstallCommand('gemini', skillId, skillFileUrl),
    description: 'Google AI coding assistant',
  },
}

// Helper to get all assistant IDs
export const assistantIds = Object.keys(assistants) as AssistantId[]

// Helper to get assistants as array
export const assistantList = Object.values(assistants)

// Default compatibility for skills that don't specify
export const defaultCompatibility: AssistantId[] = ['gemini']
