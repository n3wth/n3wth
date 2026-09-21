import type { Root, Element, ElementContent } from 'hast'
import { visit } from 'unist-util-visit'
import { codeToHast } from 'shiki'

function codeText(node: Element): string {
  let out = ''
  for (const child of node.children) {
    if (child.type === 'text') out += child.value
    else if (child.type === 'element') out += codeText(child)
  }
  return out
}

function langOf(code: Element): string {
  const cls = code.properties?.className
  const list = Array.isArray(cls) ? cls : cls ? [cls] : []
  const match = list.map(String).find((c) => c.startsWith('language-'))
  return match ? match.slice('language-'.length) : 'text'
}

/**
 * Rich-content pass over the rendered note:
 * - fenced code blocks are highlighted with Shiki (vesper theme; the
 *   surface/border chrome comes from .prose CSS, not inline styles)
 * - tables get a .table-scroll wrapper so wide tables scroll in place
 *   instead of stretching the page on small screens
 * - images lazy-load and decode off the critical path
 */
export function rehypeRichContent() {
  return async (tree: Root) => {
    const codeBlocks: { parent: Root | Element; index: number; code: Element }[] = []

    visit(tree, 'element', (node: Element, index, parent) => {
      if (!parent || typeof index !== 'number') return

      if (node.tagName === 'pre') {
        const first = node.children.find((c): c is Element => c.type === 'element')
        if (first?.tagName === 'code') {
          codeBlocks.push({ parent: parent as Root | Element, index, code: first })
        }
        return
      }

      if (node.tagName === 'table') {
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-scroll'] },
          children: [node],
        }
        ;(parent as Root | Element).children[index] = wrapper
        return 'skip'
      }

      if (node.tagName === 'img') {
        node.properties = { ...node.properties, loading: 'lazy', decoding: 'async' }
      }
    })

    for (const { parent, index, code } of codeBlocks) {
      const lang = langOf(code)
      try {
        const highlighted = await codeToHast(codeText(code), {
          lang,
          theme: 'vesper',
        })
        const pre = highlighted.children.find(
          (c): c is Element => c.type === 'element' && c.tagName === 'pre'
        )
        if (pre) {
          const langLabel: ElementContent | null =
            lang !== 'text'
              ? {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['code-lang'], 'aria-hidden': 'true' },
                  children: [{ type: 'text', value: lang }],
                }
              : null
          parent.children[index] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block'] },
            children: langLabel ? [langLabel, pre] : [pre],
          }
        }
      } catch {
        // Unknown language: leave the plain <pre><code> untouched.
      }
    }
  }
}
