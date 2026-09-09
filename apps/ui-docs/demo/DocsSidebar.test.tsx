import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { DocsSidebar } from './DocsSidebar'

describe('documentation sidebar', () => {
  it('exposes disclosure state and restores focus after Escape', () => {
    render(<MemoryRouter><DocsSidebar label="Documentation" activeId="start" items={[{ id: 'start', label: 'Getting Started', href: '/docs/getting-started' }]} /></MemoryRouter>)
    const toggle = screen.getByRole('button', { name: 'Documentation: Getting Started' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(toggle, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('exposes section links directly without a mobile disclosure', () => {
    const onSelect = vi.fn()
    render(<MemoryRouter><DocsSidebar label="Sections" activeId="tokens" items={[{ id: 'tokens', label: 'Tokens' }]} onSelect={onSelect} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: 'Sections: Tokens' })).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Tokens', exact: true }).at(-1)!)
    expect(onSelect).toHaveBeenCalledWith('tokens')
    expect(screen.getAllByRole('button', { name: 'Tokens', exact: true }).at(-1)).toHaveAttribute('aria-current', 'location')
  })
})
