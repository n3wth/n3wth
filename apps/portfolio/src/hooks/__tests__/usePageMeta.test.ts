// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { usePageMeta } from '../usePageMeta'

const addMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  const meta = document.createElement('meta')
  meta.setAttribute(attribute, key)
  meta.content = content
  document.head.appendChild(meta)
  return meta
}

describe('usePageMeta', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    window.history.replaceState({}, '', '/')
  })

  it('keeps canonical, Open Graph, and Twitter metadata aligned on navigation', () => {
    document.head.innerHTML = '<link rel="canonical" href="https://n3wth.com/">'
    addMeta('name', 'description', 'Old description')
    addMeta('property', 'og:title', 'Old title')
    addMeta('property', 'og:description', 'Old description')
    addMeta('property', 'og:url', 'https://n3wth.com/')
    addMeta('name', 'twitter:title', 'Old title')
    addMeta('name', 'twitter:description', 'Old description')
    window.history.replaceState({}, '', '/thinking')

    renderHook(() => usePageMeta('Thinking — Oliver Newth', 'Writing about production AI.'))

    expect(document.title).toBe('Thinking — Oliver Newth')
    expect(document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(
      'Writing about production AI.'
    )
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://n3wth.com/thinking'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content).toBe(
      'Thinking — Oliver Newth'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content).toBe(
      'Writing about production AI.'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content).toBe(
      'https://n3wth.com/thinking'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content).toBe(
      'Thinking — Oliver Newth'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.content).toBe(
      'Writing about production AI.'
    )
  })

  it('clears static noindex, article metadata and route schema on public navigation', () => {
    addMeta('name', 'robots', 'noindex, nofollow')
    addMeta('property', 'og:type', 'article')
    addMeta('property', 'article:published_time', '2026-01-01')
    addMeta('property', 'og:image', 'https://n3wth.com/og/old.png')
    document.head.insertAdjacentHTML('beforeend', '<script type="application/ld+json" data-page-json-ld>{"@type":"Article"}</script><script type="application/ld+json" id="identity">{"@type":"Person"}</script>')

    renderHook(() => usePageMeta('Support', 'Help with projects.'))

    expect(document.querySelector('meta[name="robots"]')).toBeNull()
    expect(document.querySelector('meta[property="article:published_time"]')).toBeNull()
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://n3wth.com/og-image.png')
    expect(document.querySelector('script[data-page-json-ld]')).toBeNull()
    expect(document.getElementById('identity')).not.toBeNull()
  })

  it('replaces article and robots state across successive routes', () => {
    const { rerender } = renderHook(({ noindex, publishedTime }: { noindex: boolean; publishedTime?: string }) => usePageMeta('Route', 'Description', { noindex, publishedTime }), {
      initialProps: { noindex: true, publishedTime: undefined },
    })
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    rerender({ noindex: false, publishedTime: '2026-09-01' })
    expect(document.querySelector('meta[name="robots"]')).toBeNull()
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article')
    expect(document.querySelector('meta[property="article:published_time"]')).toHaveAttribute('content', '2026-09-01')
    rerender({ noindex: false, publishedTime: undefined })
    expect(document.querySelector('meta[property="article:published_time"]')).toBeNull()
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'website')
  })
})
