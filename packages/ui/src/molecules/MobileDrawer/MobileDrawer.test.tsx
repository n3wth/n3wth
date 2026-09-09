import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { MobileDrawer } from './MobileDrawer'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; this.querySelector<HTMLElement>('button, a, input')?.focus() }
  HTMLDialogElement.prototype.close = function () { this.open = false }
})

describe('MobileDrawer', () => {
  it('renders children', () => {
    render(
      <MobileDrawer isOpen={true} onClose={() => {}}>
        <button>Menu Item</button>
      </MobileDrawer>
    )
    expect(screen.getByText('Menu Item')).toBeInTheDocument()
  })

  it('has dialog role with aria-modal', () => {
    render(
      <MobileDrawer isOpen={true} onClose={() => {}}>
        Content
      </MobileDrawer>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('has accessible label', () => {
    render(
      <MobileDrawer isOpen={true} onClose={() => {}} ariaLabel="Test drawer">
        Content
      </MobileDrawer>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Test drawer')
  })

  it('marks dialog as hidden when closed', () => {
    render(
      <MobileDrawer isOpen={false} onClose={() => {}}>
        Content
      </MobileDrawer>
    )
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true')
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <MobileDrawer isOpen={true} onClose={onClose}>
        <button>Item</button>
      </MobileDrawer>
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={onClose}>
        Content
      </MobileDrawer>
    )
    // Native backdrop clicks target the dialog itself.
    const backdrop = container.querySelector('dialog')
    if (backdrop) await user.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('locks body scroll when open', () => {
    const { unmount } = render(
      <MobileDrawer isOpen={true} onClose={() => {}}>
        Content
      </MobileDrawer>
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
