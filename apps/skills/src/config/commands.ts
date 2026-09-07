import type { AssistantId } from './assistants'

// Install command configuration for each assistant
export interface InstallCommand {
  name: string
  assistantId: AssistantId | 'all'
  command: string
  primary: boolean
}

// Install commands configuration for all supported AI assistants
export const installCommands: InstallCommand[] = [
  {
    name: 'For Gemini CLI',
    assistantId: 'gemini',
    command: 'curl -fsSL https://skills.n3wth.com/install.sh | bash -s -- gemini',
    primary: true,
  },
]

// Helper to get install command for a specific assistant
export function getInstallCommand(assistantId: AssistantId): InstallCommand | undefined {
  return installCommands.find(cmd => cmd.assistantId === assistantId)
}

// Helper to get skill-specific install command for an assistant
export function getSkillInstallCommand(
  assistantId: AssistantId, 
  skillId: string, 
  skillFileUrl?: string
): string {
  const skillsDir = {
    gemini: '~/.gemini/skills',
  }

  if (skillFileUrl) {
    return `mkdir -p ${skillsDir[assistantId]} && curl -fsSL ${skillFileUrl} -o ${skillsDir[assistantId]}/${skillId}.md`
  }
  
  return ''
}
