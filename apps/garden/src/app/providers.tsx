'use client'

import { Link } from 'next-view-transitions'
import { Theme } from '@astryxdesign/core/theme'
import { LinkProvider } from '@astryxdesign/core/Link'
import { ToastViewport } from '@astryxdesign/core/Toast'
import { n3wthTheme } from '@/theme/n3wthTheme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={n3wthTheme} mode="dark">
      <LinkProvider component={Link}>
        <ToastViewport position="bottomEnd">{children}</ToastViewport>
      </LinkProvider>
    </Theme>
  )
}
