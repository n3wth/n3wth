'use client'

import Link from 'next/link'
import { N3wthProvider } from '@n3wth/ui/site'
import { LinkProvider } from '@astryxdesign/core/Link'
import { ToastViewport } from '@astryxdesign/core/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <N3wthProvider mode="dark">
      <LinkProvider component={Link}>
        <ToastViewport position="bottomEnd">{children}</ToastViewport>
      </LinkProvider>
    </N3wthProvider>
  )
}
