import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { SKIP, visit } from 'unist-util-visit'
import { remarkCallouts } from '../plugins/remark-callouts.ts'
import { remarkStripDataview } from '../plugins/remark-strip-dataview.ts'
import { remarkStripTitle } from '../plugins/remark-strip-title.ts'

const wikilinkRegex = /\[\[([^\[\]\|#]+)(?:#([^\[\]\|]*))?\|?([^\[\]]*?)?\]\]/g

export function createNoteProcessor({ stripTitle = true } = {}) {
  let processor = unified().use(remarkParse).use(remarkGfm).use(remarkStripDataview)
  if (stripTitle) processor = processor.use(remarkStripTitle)
  return processor.use(remarkCallouts)
}

export function matchWikilinks(value) {
  return Array.from(value.matchAll(wikilinkRegex), (match) => ({
    target: match[1].trim(),
    heading: (match[2] || '').trim(),
    alias: (match[3] || '').trim(),
    index: match.index,
    length: match[0].length,
    embed: match.index > 0 && value[match.index - 1] === '!',
  }))
}

export function visitWikilinkText(tree, visitor) {
  visit(tree, (node, index, parent) => {
    if (node.type === 'link' || node.type === 'linkReference') return SKIP
    if (node.type === 'text' && parent && index !== undefined) {
      return visitor(node, index, parent)
    }
  })
}

export function plainWikilinkText(value) {
  let result = ''
  let lastIndex = 0
  for (const match of matchWikilinks(value)) {
    result += value.slice(lastIndex, match.embed ? match.index - 1 : match.index)
    if (!match.embed) result += match.alias || match.target
    lastIndex = match.index + match.length
  }
  return result + value.slice(lastIndex)
}

export function getWikilinkMentions(content) {
  const processor = createNoteProcessor()
  const tree = processor.runSync(processor.parse(content))
  const mentions = []

  visit(tree, (block) => {
    if (!['paragraph', 'heading', 'tableCell'].includes(block.type)) return

    let context = ''
    const offsets = new Map()
    visit(block, (node) => {
      if (node.type === 'text') {
        offsets.set(node, context.length)
        context += node.value
      } else if (node.type === 'inlineCode') {
        context += node.value
      } else if (node.type === 'break') {
        context += '\n'
      } else if (node.type === 'image' || node.type === 'imageReference') {
        context += node.alt || ''
      }
    })

    visitWikilinkText(block, (node) => {
      for (const match of matchWikilinks(node.value)) {
        if (match.embed || !match.target) continue
        mentions.push({
          target: match.target,
          alias: match.alias,
          context,
          index: offsets.get(node) + match.index,
          length: match.length,
        })
      }
    })
    return SKIP
  })

  return mentions
}

export function extractWikilinks(content) {
  return [...new Set(getWikilinkMentions(content).map((mention) => mention.target))]
}
