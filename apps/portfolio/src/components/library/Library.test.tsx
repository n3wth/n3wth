import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import Library from '../../screens/Library'

it.each([true, false])('hydrates server-rendered library with reduced motion %s', async reducedMotion => {
  const container = document.createElement('div')
  const browserWindow = window
  const matchMedia = vi.spyOn(browserWindow, 'matchMedia').mockImplementation(query => ({
    matches: reducedMotion,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  let html: string
  vi.stubGlobal('window', undefined)
  try {
    html = renderToString(<Library />)
  } finally {
    vi.stubGlobal('window', browserWindow)
  }
  expect(html).toContain('Resize the window to see the note move below the text.')
  expect(html).not.toContain('skills.n3wth.com')
  expect(html).not.toContain('<template')
  container.innerHTML = html
  document.body.append(container)
  const heading = container.querySelector('h1')
  const errors: unknown[] = []
  let root: ReturnType<typeof hydrateRoot> | undefined
  try {
    await act(async () => {
      root = hydrateRoot(container, <Library />, { onRecoverableError: error => errors.push(error) })
    })
    expect(errors).toEqual([])
    expect(container.querySelector('h1')).toBe(heading)
    expect(container.querySelector('#skills')).toBeNull()
  } finally {
    await act(async () => root?.unmount())
    container.remove()
    matchMedia.mockRestore()
  }
})
