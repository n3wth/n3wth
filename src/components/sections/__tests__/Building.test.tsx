import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Building } from '../Building'

describe('Project portfolio', () => {
  it('leads with the three connected projects and retains other explorations', () => {
    render(<Building />)
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['r3', 'kit', 'skills', 'hop.flights', 'garden'])
  })

  it('provides live projects and public source links', () => {
    render(<Building />)
    expect(screen.getByRole('link', { name: 'Explore r3' })).toHaveAttribute('href', 'https://r3.n3wth.com')
    expect(screen.getAllByRole('link', { name: 'Read the source' }).map((link) => link.getAttribute('href'))).toEqual(['https://github.com/n3wth/r3', 'https://github.com/n3wth/kit', 'https://github.com/n3wth/skills'])
  })
})
