export const recoverableGardenSlugs = new Set([
  'actual-gardening-costs',
  'career-planning',
  'frameworks/5-whys',
])

function slugifySegment(segment: string): string {
  return segment
    .replace(/\+/g, ' ')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolveLegacySlug(slug: string): string | undefined {
  if (recoverableGardenSlugs.has(slug)) return undefined

  const candidate = slug.split('/').map(slugifySegment).join('/')
  if (!candidate || candidate === slug || !recoverableGardenSlugs.has(candidate)) return undefined

  return candidate
}
