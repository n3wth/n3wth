import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../Home'

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

    render(<MemoryRouter><Home /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'I build new ways to work with AI.' })).toBeInTheDocument()
    expect(screen.getByText('Oliver Newth')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore my projects' })).toHaveAttribute('href', '/work#building')
    expect(screen.queryByRole('navigation', { name: 'Site chapters' })).toBeNull()
  })
})
