import { visit } from 'unist-util-visit'
import type { Root, Blockquote } from 'mdast'

const calloutRegex = /^\[!([\w-]+)\|?(.+?)?\]([+-]?)/
const calloutMapping: Record<string, string> = {
  note: 'note',
  abstract: 'abstract',
  summary: 'abstract',
  tldr: 'abstract',
  info: 'info',
  todo: 'todo',
  tip: 'tip',
  hint: 'tip',
  important: 'tip',
  success: 'success',
  check: 'success',
  done: 'success',
  question: 'question',
  help: 'question',
  faq: 'question',
  warning: 'warning',
  attention: 'warning',
  caution: 'warning',
  failure: 'failure',
  missing: 'failure',
  fail: 'failure',
  danger: 'danger',
  error: 'danger',
  bug: 'bug',
  example: 'example',
  quote: 'quote',
  cite: 'quote',
}

const calloutIcons: Record<string, string> = {
  note: 'pencil',
  abstract: 'clipboard-list',
  info: 'info',
  todo: 'check-circle',
  tip: 'flame',
  success: 'check',
  question: 'help-circle',
  warning: 'alert-triangle',
  failure: 'x',
  danger: 'zap',
  bug: 'bug',
  example: 'list',
  quote: 'quote',
}

export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return

      const firstChild = node.children[0]
      if (!firstChild || firstChild.type !== 'paragraph') return

      const firstInline = firstChild.children[0]
      if (!firstInline || firstInline.type !== 'text') return

      const match = firstInline.value.match(calloutRegex)
      if (!match) return

      const [fullMatch, rawType, customTitle] = match
      const calloutType = calloutMapping[rawType.toLowerCase()] || rawType.toLowerCase()
      const title = customTitle || calloutType.charAt(0).toUpperCase() + calloutType.slice(1)

      // Remove the callout syntax from the first text node
      firstInline.value = firstInline.value.slice(fullMatch.length).trim()
      if (!firstInline.value) {
        firstChild.children.shift()
      }

      // If the paragraph is now empty, remove it
      if (firstChild.children.length === 0) {
        node.children.shift()
      }

      // Wrap in callout HTML
      const bodyNodes = node.children

      const calloutNode = {
        type: 'html' as const,
        value: `<div class="callout callout-${calloutType}" data-callout="${calloutType}"><div class="callout-title">${title}</div><div class="callout-content">`,
      }
      const closeNode = {
        type: 'html' as const,
        value: '</div></div>',
      }

      parent.children.splice(index, 1, calloutNode as any, ...bodyNodes, closeNode as any)
    })
  }
}
