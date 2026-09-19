export interface DocPageMeta {
  slug: string
  title: string
  description: string
  indexTitle: string
  indexOrder: number
}

export const docPageMeta: readonly DocPageMeta[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Create a site in the workspace using the shared UI page system and Astryx primitives.',
    indexTitle: 'Workspace setup',
    indexOrder: 0,
  },
  {
    slug: 'theming',
    title: 'Theming',
    description: 'Shared brand tokens, typography, fonts and provider ownership.',
    indexTitle: 'Theme and typography',
    indexOrder: 2,
  },
  {
    slug: 'components',
    title: 'Components',
    description: 'Choose between site compositions, native Astryx primitives and existing UI adapters.',
    indexTitle: 'Component boundaries',
    indexOrder: 1,
  },
  {
    slug: 'hooks',
    title: 'Hooks',
    description: 'Theme state, focus behavior and intentional product feedback.',
    indexTitle: 'Behavior and hooks',
    indexOrder: 3,
  },
  {
    slug: 'css-utilities',
    title: 'CSS Utilities',
    description: 'Site styles, the Tailwind theme facade and compatibility CSS.',
    indexTitle: 'CSS integration',
    indexOrder: 4,
  },
]

export function docSource(slug: string) {
  return `../docs/${slug}.md`
}

export function resolveDocPages<Content>(modules: Record<string, { default?: Content }>) {
  return docPageMeta.map(page => {
    const source = docSource(page.slug)
    const content = modules[source]?.default
    if (content == null) {
      throw new Error(`Missing documentation content for "${page.slug}": expected a default export from "${source}".`)
    }
    return { ...page, content }
  })
}

export const routes = ['/', '/components', ...docPageMeta.map(page => `/docs/${page.slug}`)]

export const documentationIndex = [
  { title: 'System overview', path: '/' },
  { title: 'Component examples and compatibility APIs', path: '/components' },
  ...[...docPageMeta].sort((first, second) => first.indexOrder - second.indexOrder).map(page => ({
    title: page.indexTitle,
    path: `/docs/${page.slug}`,
  })),
]

export function renderDocumentationIndex(template: string) {
  if (template.split('{{DOCUMENTATION_INDEX}}').length !== 2) {
    throw new Error('llms.txt must contain exactly one documentation index placeholder')
  }
  return template.replace('{{DOCUMENTATION_INDEX}}', () =>
    documentationIndex.map(page => `- ${page.title}: https://ui.n3wth.com${page.path}`).join('\n'))
}
