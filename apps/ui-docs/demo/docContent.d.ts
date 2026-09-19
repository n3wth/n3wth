declare module 'virtual:doc-content' {
  import type { ComponentType } from 'react'
  const modules: Record<string, { default: ComponentType }>
  export default modules
}
