# Hooks and Behavior

Keep product state in the site. Use primitive behavior through Astryx and shared page behavior through UI.

## Theme state

The existing UI useTheme hook supports persisted theme selection. Pass that same mode to N3wthProvider so the page, controls and document agree.

```tsx
import type { ReactNode } from 'react'
import { useTheme } from '@n3wth/ui'
import { N3wthProvider } from '@n3wth/ui/site'

export function AppTheme({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  return <N3wthProvider mode={theme}>{children}</N3wthProvider>
}
```

Add a visible theme control only when the product needs one. Label icon-only actions and preserve keyboard focus.

## Navigation and focus

SiteNavigation owns mobile menu disclosure and dismissal. Apps provide their own links and actions. Dialogs, tabs and other controls should use the primitive behavior exposed by the package rather than another app-local implementation.

Verify the actual keyboard sequence: open, enter the control, move between options, activate, and dismiss. A visual check alone does not verify focus behavior.

## Motion

Content should appear immediately when a route changes. Do not add page-entry fades, staggered text, delayed sections or decorative translation to the shared shell.

Existing animation hooks remain compatibility tools for deliberate product demonstrations and feedback. Their presence is not a recommendation to animate ordinary reading content. Respect reduced-motion preferences and keep essential state changes understandable without animation.

## Existing utilities

Root UI hooks also include application utilities such as useMediaQuery, useLocalStorage and useKeyboardShortcuts. Consult the workspace types before using a utility; avoid assuming every root hook is a native Astryx export.
