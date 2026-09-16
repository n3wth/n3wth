import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../Home'
import { Nav } from '../../components/Nav'

vi.mock('../../components/NightField', () => new Promise(() => {}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Homepage without a ready scene', () => {
  it.each([false, true])('keeps identity available (WebGL: %s)', (webgl) => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      webgl ? {} as WebGLRenderingContext : null
    )

    render(<MemoryRouter><Nav /><Home /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'I build new ways to work with AI.' })).toBeInTheDocument()
    expect(screen.getAllByText('Oliver Newth').length).toBeGreaterThan(0)
    for (const name of ['Work', 'Art', 'Thinking', 'Library', 'Contact']) {
      expect(screen.getByRole('link', { name, exact: true })).toHaveAttribute('href', `/${name.toLowerCase()}`)
    }
    expect(screen.queryByRole('navigation', { name: 'Scene destinations' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Explore my projects' })).toHaveAttribute('href', '/work#building')
    expect(screen.queryByRole('navigation', { name: 'Site chapters' })).toBeNull()
  })
})
