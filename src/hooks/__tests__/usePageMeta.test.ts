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
      'http://localhost:3000/thinking'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content).toBe(
      'Thinking — Oliver Newth'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content).toBe(
      'Writing about production AI.'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content).toBe(
      'http://localhost:3000/thinking'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content).toBe(
      'Thinking — Oliver Newth'
    )
    expect(document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.content).toBe(
      'Writing about production AI.'
    )
  })
})
