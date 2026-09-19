import { describe, expect, it } from 'vitest'
import { docPageMeta, docSource, documentationIndex, renderDocumentationIndex, resolveDocPages, routes } from './docPages'

const markdown = import.meta.glob<{ default: string }>('../docs/*.md', { eager: true, query: '?raw' })
const expectedSlugs = ['getting-started', 'theming', 'components', 'hooks', 'css-utilities']

describe('published documentation catalog', () => {
  it('preserves the explicit published order, titles and descriptions', () => {
    expect(docPageMeta.map(page => page.slug)).toEqual(expectedSlugs)
    expect(docPageMeta.map(page => [page.title, page.description])).toEqual([
      ['Getting Started', 'Create a site in the workspace using the shared UI page system and Astryx primitives.'],
      ['Theming', 'Shared brand tokens, typography, fonts and provider ownership.'],
      ['Components', 'Choose between site compositions, native Astryx primitives and existing UI adapters.'],
      ['Hooks', 'Theme state, focus behavior and intentional product feedback.'],
      ['CSS Utilities', 'Site styles, the Tailwind theme facade and compatibility CSS.'],
    ])
    expect(routes).toEqual(['/', '/components', ...expectedSlugs.map(slug => `/docs/${slug}`)])
    for (const field of ['slug', 'indexOrder'] as const) {
      expect(new Set(docPageMeta.map(page => page[field])).size).toBe(docPageMeta.length)
    }
  })

  it('matches each published page to its slug-derived source, without publishing other Markdown', () => {
    const pages = resolveDocPages({ ...markdown, '../docs/unpublished.md': { default: 'Unpublished' } })
    expect(pages.map(page => page.slug)).toEqual(expectedSlugs)
    for (const page of pages) {
      expect(page.content).toBe(markdown[docSource(page.slug)].default)
      expect(page.content.trim().length).toBeGreaterThan(0)
    }
    expect(pages.find(page => page.slug === 'not-a-page')).toBeUndefined()
    expect(pages.find(page => page.slug === 'site-maintenance')).toBeUndefined()
    expect(pages.find(page => page.slug === 'unpublished')).toBeUndefined()
  })

  it.each([undefined, {}])('identifies the published page and source when matching content is missing (%s)', missing => {
    const modules: Record<string, { default?: string }> = { ...markdown }
    if (missing === undefined) delete modules['../docs/theming.md']
    else modules['../docs/theming.md'] = missing
    expect(() => resolveDocPages(modules)).toThrow(
      'Missing documentation content for "theming": expected a default export from "../docs/theming.md".',
    )
  })

  it('preserves public index labels and its existing order independently of navigation', () => {
    expect(documentationIndex).toEqual([
      { title: 'System overview', path: '/' },
      { title: 'Component examples and compatibility APIs', path: '/components' },
      { title: 'Workspace setup', path: '/docs/getting-started' },
      { title: 'Component boundaries', path: '/docs/components' },
      { title: 'Theme and typography', path: '/docs/theming' },
      { title: 'Behavior and hooks', path: '/docs/hooks' },
      { title: 'CSS integration', path: '/docs/css-utilities' },
    ])
    expect(documentationIndex.map(page => page.path).sort()).toEqual([...routes].sort())
    expect(docPageMeta.map(page => page.slug)).toEqual(expectedSlugs)
  })

  it('renders the same index template for dev and prerender without changing surrounding content', () => {
    const template = 'Before\n{{DOCUMENTATION_INDEX}}\nAfter'
    expect(renderDocumentationIndex(template)).toBe([
      'Before',
      ...documentationIndex.map(page => `- ${page.title}: https://ui.n3wth.com${page.path}`),
      'After',
    ].join('\n'))
  })

  it.each(['No placeholder', '{{DOCUMENTATION_INDEX}}\n{{DOCUMENTATION_INDEX}}'])('rejects an invalid index template: %s', template => {
    expect(() => renderDocumentationIndex(template)).toThrow('llms.txt must contain exactly one documentation index placeholder')
  })
})
