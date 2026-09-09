/** Values shared by social metadata and the Article structured data. */
export function noteMetadata(note: { title: string; description?: string; date?: string }, slug: string, origin: string) {
  const published = note.date ? new Date(note.date) : null
  return {
    description: note.description || `${note.title} - n3wth/garden`,
    image: new URL(`/og/${slug}`, origin).href,
    publishedTime: published && !isNaN(published.getTime()) ? published.toISOString() : undefined,
  }
}
