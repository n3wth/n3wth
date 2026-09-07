import { visit } from 'unist-util-visit'
import type { Root, Heading } from 'mdast'

export function remarkStripTitle() {
  return (tree: Root) => {
    let found = false
    visit(tree, 'heading', (node: Heading, index, parent) => {
      if (found || !parent || index === undefined) return
      if (node.depth === 1) {
        parent.children.splice(index, 1)
        found = true
        return index
      }
    })
  }
}
