import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReadingOutline } from './ReadingOutline'

const items = [{ id: 'overview', label: 'Overview', level: 2 }, { id: 'details', label: 'Details', level: 3 }]

describe('ReadingOutline', () => {
  it('starts collapsed and exposes linked contents after keyboard-compatible button activation', () => {
    render(<ReadingOutline items={items} collapsible />)
    const button = screen.getByRole('button', { name: 'On this page' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById(button.getAttribute('aria-controls')!)).not.toBeVisible()
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '#overview')
    fireEvent.click(button)
    expect(screen.queryByRole('link', { name: 'Overview' })).toBeNull()
  })

  it('keeps desktop navigation available without a disclosure button', () => {
    render(<ReadingOutline items={items} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '#details')
  })
})
