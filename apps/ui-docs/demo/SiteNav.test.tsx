import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { SiteNav } from './SiteNav'

describe('SiteNav', () => {
  it('preserves GitHub and exposes the shared mobile navigation', () => {
    render(
      <MemoryRouter>
        <SiteNav />
      </MemoryRouter>
    )

    const github = screen.getByRole('link', { name: 'GitHub' })
    expect(github).toBeInTheDocument()
    expect(github).toHaveAttribute('href', 'https://github.com/n3wth/n3wth/tree/main/packages/ui')

    // The shared shell provides mobile navigation on every site.
    expect(
      screen.queryByRole('button', { name: /menu|hamburger|nav/i })
    ).toBeInTheDocument()
  })
})
