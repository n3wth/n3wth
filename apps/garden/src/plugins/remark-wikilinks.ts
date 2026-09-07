import { visit } from 'unist-util-visit'
import type { Root, Text, Link, PhrasingContent } from 'mdast'
import { resolveWikilink, getNoteBySlug } from '@/lib/content'

const wikilinkRegex = /\[\[([^\[\]\|#]+)(?:#([^\[\]\|]*))?\|?([^\[\]]*?)?\]\]/g

// Reference-style images whose definition doesn't exist ship as literal
// "![alt]" text; drop them. The (?!\() guard protects real inline images.
const danglingImageRegex = /!\[[^\]]*\](?!\()/g

const stripDanglingImages = (text: string) => text.replace(danglingImageRegex, '')

export function remarkWikilinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return

      const value = node.value
      const regex = new RegExp(wikilinkRegex.source, wikilinkRegex.flags)
      const children: PhrasingContent[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(value)) !== null) {
        const [full, target, _heading, alias] = match
        // ![[Target]] is an Obsidian embed, not a link; attachments are
        // excluded from the build (same call as remark-strip-dataview), so
        // drop the embed entirely — bang included.
        const isEmbed = match.index > 0 && value[match.index - 1] === '!'
        let before = value.slice(lastIndex, isEmbed ? match.index - 1 : match.index)
        before = stripDanglingImages(before)

        if (before) {
          children.push({ type: 'text', value: before })
        }

        if (isEmbed) {
          lastIndex = match.index + full.length
          continue
        }

        const resolvedSlug = resolveWikilink(target.trim())
        const resolvedNote = resolvedSlug ? getNoteBySlug(resolvedSlug) : undefined
        const displayText = alias ? alias.trim() : (resolvedNote?.title || target.trim().split('/').pop() || target.trim())

        if (resolvedSlug) {
          const link: Link = {
            type: 'link',
            url: `/${resolvedSlug}`,
            children: [{ type: 'text', value: displayText }],
            data: {
              hProperties: { className: 'internal-link' },
            },
          }
          children.push(link)
        } else {
          children.push({
            type: 'html',
            value: `<span class="broken-link" title="Page not found: ${target.trim()}">${displayText}</span>`,
          } as unknown as PhrasingContent)
        }

        lastIndex = match.index + full.length
      }

      if (lastIndex === 0) {
        // no wikilinks or embeds; still scrub dangling reference images
        const stripped = stripDanglingImages(value)
        if (stripped !== value) node.value = stripped
        return
      }

      const remaining = stripDanglingImages(value.slice(lastIndex))
      if (remaining) {
        children.push({ type: 'text', value: remaining })
      }

      parent.children.splice(index, 1, ...children)
    })
  }
}
