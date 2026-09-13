function contentExcerpt(content: string | undefined, max = 160): string | undefined {
  if (!content) return undefined

  const withoutCode = content.replace(/```[\s\S]*?(```|$)/g, '\n')
  const blocks = withoutCode.split(/\n{2,}/)

  for (const block of blocks) {
    const text = block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !/^(#{1,6}\s|>\s?|[-*+]\s|\d+[.)]\s|\||!|\[\[.*\]\]$)/.test(line))
      .join(' ')
      .replace(/!\[\[[^\]]*\]\]/g, '')
      .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
      .replace(/\[\[([^\]]*)\]\]/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_~`]+/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (text.length < 2) continue
    if (text.length <= max) return text
    const cut = text.slice(0, max)
    return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`
  }

  return undefined
}

/** Values shared by social metadata and the Article structured data. */
export function noteMetadata(
  note: { title: string; description?: string; date?: string; content?: string },
  slug: string,
  origin: string,
  modified?: number
) {
  const published = note.date ? new Date(note.date) : null
  return {
    description: note.description || contentExcerpt(note.content) || `${note.title} - n3wth/garden`,
    image: new URL(`/og/${slug}`, origin).href,
    publishedTime: published && !isNaN(published.getTime()) ? published.toISOString() : undefined,
    modifiedTime: modified ? new Date(modified).toISOString() : undefined,
  }
}
