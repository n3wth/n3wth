import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { N3wthProvider } from '@n3wth/ui/site'
import { describe, it, expect } from 'vitest'
import { SystemHome } from './SystemHome'

describe('system guide', () => {
  it('explains ownership, links to the workspace guide and exercises the native primitive', () => {
    render(<HelmetProvider><MemoryRouter><N3wthProvider><SystemHome /></N3wthProvider></MemoryRouter></HelmetProvider>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('n3wth/ui design system')
    for (const name of ['Sites', '@n3wth/ui', 'Astryx']) {
      expect(screen.getByRole('heading', { name, exact: true })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/docs/getting-started')
    expect(screen.getByRole('link', { name: 'Astryx', exact: true })).toHaveAttribute('href', 'https://github.com/facebook/astryx')
    fireEvent.click(screen.getByRole('button', { name: 'Try the primitive' }))
    expect(screen.getByRole('status', { name: 'Primitive activation' })).toHaveTextContent('Activated 1 time')
  })
})
