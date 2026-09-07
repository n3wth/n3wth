'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    posthog.capture('install_command_copied', { command })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="group flex w-full items-center justify-between rounded-lg border border-rail bg-bg-raise px-5 py-3.5 text-left font-mono text-sm text-ink-dim transition-colors hover:border-rail-strong"
    >
      <span className="truncate">
        <span className="text-ink-faint select-none">$ </span>
        {command}
      </span>
      <span className="ml-4 shrink-0 text-xs text-ink-faint transition-colors group-hover:text-ink-dim">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}
