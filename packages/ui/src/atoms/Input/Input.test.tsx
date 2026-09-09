import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'
import { Input } from './Input'

expect.extend(matchers)

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('displays error message when error is a string', () => {
    render(<Input id="email" error="Invalid email" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input error={true} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not show error message when error is boolean', () => {
    render(<Input error={true} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders left and right icons', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      />
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('applies glass variant', () => {
    const { container } = render(<Input variant="glass" />)
    expect(container.querySelector('.backdrop-blur-lg')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeEnabled()
  })

  it('links error message with aria-describedby', () => {
    render(<Input id="field" error="Required" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'field-error')
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'field-error')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Input aria-label="Email" placeholder="Enter email" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  it('preserves an external label, native type and uncontrolled form reset', async () => {
    const user = userEvent.setup()
    render(<form><label htmlFor="quantity">Quantity</label><Input id="quantity" name="quantity" type="number" defaultValue="2" /><button type="reset">Reset</button></form>)
    const input = screen.getByLabelText('Quantity')
    expect(input).toHaveAttribute('id', 'quantity')
    expect(input).toHaveAttribute('name', 'quantity')
    await user.clear(input)
    await user.type(input, '7')
    expect(input).toHaveValue(7)
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(input).toHaveValue(2)
  })

})
