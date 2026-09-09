import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'
import { Switch } from './Switch'

expect.extend(matchers)

describe('Switch', () => {
  it('renders with role="switch"', () => {
    render(<Switch label="Toggle" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('has aria-checked false by default', () => {
    render(<Switch label="Toggle" />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('respects defaultChecked', () => {
    render(<Switch label="Toggle" defaultChecked />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('toggles on click (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(<Switch label="Toggle" />)
    const sw = screen.getByRole('switch')
    expect(sw).not.toBeChecked()
    await user.click(sw)
    expect(sw).toBeChecked()
    await user.click(sw)
    expect(sw).not.toBeChecked()
  })

  it('calls onChange with the new checked value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch label="Toggle" onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('works as controlled component', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<Switch label="Toggle" checked={false} onChange={onChange} />)
    const sw = screen.getByRole('switch')
    expect(sw).not.toBeChecked()

    await user.click(sw)
    expect(onChange).toHaveBeenCalledWith(true)
    // Still false because parent hasn't updated
    expect(sw).not.toBeChecked()

    // Parent updates
    rerender(<Switch label="Toggle" checked={true} onChange={onChange} />)
    expect(sw).toBeChecked()
  })

  it('toggles on Space key', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch label="Toggle" onChange={onChange} />)
    screen.getByRole('switch').focus()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('toggles on Enter key', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch label="Toggle" onChange={onChange} />)
    screen.getByRole('switch').focus()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch label="Toggle" disabled onChange={onChange} />)
    const sw = screen.getByRole('switch')
    expect(sw).toBeDisabled()
    await user.click(sw)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('sets aria-label from label prop', () => {
    render(<Switch label="Dark mode" />)
    expect(screen.getByRole('switch')).toHaveAccessibleName('Dark mode')
  })

  it('merges custom className', () => {
    render(<Switch label="Toggle" className="my-custom" />)
    expect(screen.getByRole('switch').closest('.my-custom')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = vi.fn()
    render(<Switch label="Toggle" ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Switch label="Toggle" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations when checked', async () => {
    const { container } = render(<Switch label="Toggle" checked onChange={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations when disabled', async () => {
    const { container } = render(<Switch label="Toggle" disabled />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
