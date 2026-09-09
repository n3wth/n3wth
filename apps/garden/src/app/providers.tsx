'use client'

import Link from 'next/link'
import { N3wthProvider } from '@n3wth/ui/site'
import { LinkProvider } from '@n3wth/ui/primitives'
import { ToastViewport } from '@n3wth/ui/primitives'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <N3wthProvider mode="dark">
      <LinkProvider component={Link}>
        <ToastViewport position="bottomEnd">{children}</ToastViewport>
      </LinkProvider>
    </N3wthProvider>
  )
}
