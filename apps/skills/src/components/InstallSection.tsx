'use client'
import { useState } from 'react'
import { CodeBlock } from '@n3wth/ui'
import { Button } from '@n3wth/ui/primitives'
import { SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'
import { installCommands } from '../config/commands'
import { trackCopyEvent } from '../lib/analytics'

const command = installCommands.find(item => item.assistantId === 'gemini')!.command

export function InstallSection() {
  const [copyStatus, setCopyStatus] = useState('')

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      setCopyStatus('Copy failed. Select the command and copy it manually.')
      return
    }
    setCopyStatus('Command copied. Run it in your terminal to install.')
    trackCopyEvent('for-antigravity-cli')
  }

  return (
    <SiteSection>
      <div className="flex flex-col items-start gap-4">
        <SiteHeading variant="section">Install skills</SiteHeading>
        <div className="max-w-2xl"><SiteText>
          Run this command to copy the catalog to <code>~/.gemini/skills</code>.
          {' '}Requires Bash, curl, and Git. Existing skill files are skipped.
        </SiteText></div>
        <CodeBlock code={command} language="bash" size="sm" />
        <Button label="Copy install command" onClick={copyCommand} style={{ minHeight: 44 }} />
        <SiteText role="status" aria-live="polite">{copyStatus}</SiteText>
      </div>
    </SiteSection>
  )
}
