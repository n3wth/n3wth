import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { DocsSidebar } from './DocsSidebar'

describe('documentation sidebar', () => {
  it('exposes documentation routes directly', () => {
    render(<MemoryRouter><DocsSidebar label="Documentation" activeId="start" items={[{ id: 'start', label: 'Getting Started', href: '/docs/getting-started' }]} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: 'Documentation: Getting Started' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Getting Started' }).at(-1)).toHaveAttribute('href', '/docs/getting-started')
  })

  it('exposes section links directly without a mobile disclosure', () => {
    const onSelect = vi.fn()
    render(<MemoryRouter><DocsSidebar label="Sections" activeId="tokens" items={[{ id: 'tokens', label: 'Tokens' }]} onSelect={onSelect} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: 'Sections: Tokens' })).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Tokens', exact: true }).at(-1)!)
    expect(onSelect).toHaveBeenCalledWith('tokens')
    expect(screen.getAllByRole('button', { name: 'Tokens', exact: true }).at(-1)).not.toHaveAttribute('aria-current')
  })
})
