import type { ComponentType } from 'react'
import { N3wthProvider } from '@n3wth/ui/site'

/** Each independently hydrated Astro island owns its React theme context. */
export function withTheme<Props extends object>(Content: ComponentType<Props>) {
  return function ThemedIsland(props: Props) {
    return <N3wthProvider mode="dark"><Content {...props} /></N3wthProvider>
  }
}
