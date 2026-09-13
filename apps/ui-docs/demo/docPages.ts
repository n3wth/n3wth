export interface DocPageMeta {
  slug: string
  title: string
  description: string
}

const DOC_ORDER = ['getting-started', 'theming', 'components', 'hooks', 'css-utilities']

const DOC_DESCRIPTIONS: Record<string, string> = {
  'getting-started': 'Create a site in the workspace using the shared UI page system and Astryx primitives.',
  'theming': 'Shared brand tokens, typography, fonts and provider ownership.',
  'components': 'Choose between site compositions, native Astryx primitives and existing UI adapters.',
  'hooks': 'Theme state, focus behavior and intentional product feedback.',
  'css-utilities': 'Site styles, the Tailwind theme facade and compatibility CSS.',
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/css /i, 'CSS ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export const docPageMeta: DocPageMeta[] = DOC_ORDER.map((slug) => ({
  slug,
  title: slugToTitle(slug),
  description: DOC_DESCRIPTIONS[slug] || `Documentation for ${slugToTitle(slug)} in @n3wth/ui design system.`,
}))
