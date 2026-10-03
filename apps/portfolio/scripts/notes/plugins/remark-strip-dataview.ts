import { visit } from 'unist-util-visit'
import type { Root, Code } from 'mdast'

export function remarkStripDataview() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (!parent || index === undefined) return
      if (node.lang === 'dataview' || node.lang === 'dataviewjs') {
        parent.children.splice(index, 1)
        return index
      }
    })
  }
}
