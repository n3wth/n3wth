import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { N3wthProvider } from '@n3wth/ui/site'
import { describe, it, expect } from 'vitest'
import { SystemHome } from './SystemHome'

describe('system guide', () => {
  it('offers accessible paths into the garden and retains ownership guidance', () => {
    render(<HelmetProvider><MemoryRouter><N3wthProvider><SystemHome /></N3wthProvider></MemoryRouter></HelmetProvider>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Make room for your next idea.')
    for (const name of ['Sites', '@n3wth/ui', 'Astryx']) {
      expect(screen.getByRole('heading', { name, exact: true })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/docs/getting-started')
    expect(screen.getByRole('link', { name: 'Astryx', exact: true })).toHaveAttribute('href', 'https://github.com/facebook/astryx')
    expect(screen.getByRole('link', { name: /Typography/ })).toHaveAttribute('href', '/components#typography')
    expect(screen.getByRole('link', { name: /Colour/ })).toHaveAttribute('href', '/components#tokens')
    expect(screen.getByRole('link', { name: /Controls/ })).toHaveAttribute('href', '/components#atoms')
  })
})
