'use client'

import { CommandBox } from '@n3wth/ui'
import posthog from 'posthog-js'

interface InstallCommandProps {
  command: string
  contentId?: string
  destinationId?: string
}

export function InstallCommand({ command, contentId, destinationId }: InstallCommandProps) {
  const handleCopy = () => {
    const properties = contentId || destinationId
      ? {
          ...(contentId && { content_id: contentId }),
          ...(destinationId && { destination_id: destinationId }),
        }
      : { command }

    posthog.capture('install_command_copied', properties)
  }

  return <CommandBox command={command} onCopy={handleCopy} />
}
