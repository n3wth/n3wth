'use client'

import { CommandBox } from '@n3wth/ui'
import posthog from 'posthog-js'

export function InstallCommand({ command }: { command: string }) {
  return <CommandBox command={command} onCopy={() => posthog.capture('install_command_copied', { command })} />
}
