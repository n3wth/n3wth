import type { Root, Text, Link, PhrasingContent, Parents } from 'mdast'
import { resolveWikilink, getNoteBySlug } from '../lib/content.ts'
import { slug } from 'github-slugger'
import { notePath } from '../routes.mjs'
import { matchWikilinks, visitWikilinkText } from '../lib/note-links.mjs'

// Reference-style images whose definition doesn't exist ship as literal
// "![alt]" text; drop them. The (?!\() guard protects real inline images.
const danglingImageRegex = /!\[[^\]]*\](?!\()/g

const stripDanglingImages = (text: string) => text.replace(danglingImageRegex, '')

export function remarkWikilinks() {
  return (tree: Root) => {
    visitWikilinkText(tree, (node: Text, index: number, parent: Parents) => {
      const value = node.value
      const children: PhrasingContent[] = []
      let lastIndex = 0

      for (const match of matchWikilinks(value)) {
        const { target, alias } = match
        // ![[Target]] is an Obsidian embed, not a link; attachments are
        // excluded from the build (same call as remark-strip-dataview), so
        // drop the embed entirely — bang included.
        const isEmbed = match.embed
        let before = value.slice(lastIndex, isEmbed ? match.index - 1 : match.index)
        before = stripDanglingImages(before)

        if (before) {
          children.push({ type: 'text', value: before })
        }

        if (isEmbed) {
          lastIndex = match.index + match.length
          continue
        }

        const resolvedSlug = resolveWikilink(target.trim())
        const resolvedNote = resolvedSlug !== null ? getNoteBySlug(resolvedSlug) : undefined
        const displayText = alias ? alias.trim() : (resolvedNote?.title || target.trim().split('/').pop() || target.trim())

        if (resolvedSlug !== null) {
          const link: Link = {
            type: 'link',
            url: `${notePath(resolvedSlug)}${match.heading && !notePath(resolvedSlug).includes('#') ? `#${slug(match.heading)}` : ''}`,
            children: [{ type: 'text', value: displayText }],
            data: {
              hProperties: { className: ['internal-link'] },
            },
          }
          children.push(link)
        } else {
          children.push({
            type: 'html',
            value: `<span class="broken-link" title="Page not found: ${target.trim()}">${displayText}</span>`,
          } as unknown as PhrasingContent)
        }

        lastIndex = match.index + match.length
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
      return index + children.length
    })
  }
}
