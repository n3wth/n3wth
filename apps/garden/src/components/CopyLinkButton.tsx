'use client'

import { IconButton } from '@astryxdesign/core/IconButton'
import { useToast } from '@astryxdesign/core/Toast'
import { Link as LinkIcon } from 'lucide-react'

export function CopyLinkButton() {
  const toast = useToast()

  return (
    <IconButton
      label="Copy link to this note"
      icon={<LinkIcon size={13} />}
      variant="ghost"
      size="sm"
      tooltip="Copy link"
      clickAction={async () => {
        await navigator.clipboard.writeText(window.location.href)
        toast({ body: 'Link copied', uniqueID: 'copy-note-link' })
      }}
    />
  )
}
