import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CommandPalette } from '../CommandPalette'

const noop = () => {}

describe('CommandPalette smoke', () => {
  it('renders a start-here set and filters live', async () => {
    render(
      <MemoryRouter>
        <CommandPalette open onClose={noop} />
      </MemoryRouter>
    )
    const input = screen.getByRole('combobox')
    expect(document.activeElement).toBe(input)
    expect(screen.getAllByRole('option').length).toBe(5)
    /* The curated empty state files its five rows under their own group
       headings. The "Start here" heading it used to carry was dropped with
       the rest of the search chrome in #94, and 'Start here' was never a
       ResultGroup, so there is no label of that name to find. */
    expect(
      screen.getAllByRole('group').map((g) => g.getAttribute('aria-labelledby'))
    ).toEqual(['command-palette-group-pages', 'command-palette-group-thinking'])

    // garden arrives via dynamic import
    await waitFor(() => {
      expect(screen.queryByText(/garden still loading/)).toBeNull()
    })

    fireEvent.change(input, { target: { value: 'flowdiagram' } })
    const options = screen.getAllByRole('option')
    expect(options[0].textContent).toContain('FlowDiagram')
    expect(options[0].getAttribute('aria-selected')).toBe('true')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id)

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    const after = screen.getAllByRole('option')
    expect(after[after.length - 1].getAttribute('aria-selected')).toBe('true')

    fireEvent.change(input, { target: { value: 'zzzznotathing' } })
    expect(screen.queryAllByRole('option').length).toBe(0)
    expect(screen.getByText(/Nothing matches/)).toBeTruthy()

    fireEvent.change(input, { target: { value: 'garden' } })
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <MemoryRouter>
        <CommandPalette open={false} onClose={noop} />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })
})
