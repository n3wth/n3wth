import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropdown } from './Dropdown'

// Only the browser's Popover API is shimmed; Astryx layer/state/focus code runs.
beforeAll(() => {
  HTMLElement.prototype.showPopover = function () {
    this.setAttribute('popover-open', '')
    const event = new Event('toggle')
    Object.defineProperty(event, 'newState', { value: 'open' })
    this.dispatchEvent(event)
  }
  HTMLElement.prototype.hidePopover = function () {
    this.removeAttribute('popover-open')
    const event = new Event('toggle')
    Object.defineProperty(event, 'newState', { value: 'closed' })
    this.dispatchEvent(event)
  }
  const matches = HTMLElement.prototype.matches
  HTMLElement.prototype.matches = function (selector) {
    return selector === ':popover-open' ? this.hasAttribute('popover-open') : matches.call(this, selector)
  }
})

const options = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana', disabled: true }, { value: 'c', label: 'Cherry' }]

describe('Dropdown Astryx adapters', () => {
  it('selects an enabled option and preserves controlled state', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Dropdown options={options} value="a" onChange={onChange} />)
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Cherry', hidden: true }))
    expect(onChange).toHaveBeenCalledWith('c')
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple')
  })

  it('skips disabled options using keyboard navigation', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Dropdown options={options} defaultValue="a" onChange={onChange} />)
    screen.getByRole('combobox').focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('keeps multiple selections independent', async () => {
    const user = userEvent.setup()
    const onMultiChange = vi.fn()
    render(<Dropdown options={options} multi defaultValues={['a']} onMultiChange={onMultiChange} />)
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Cherry', hidden: true }))
    expect(onMultiChange).toHaveBeenCalledWith(['a', 'c'])
  })

  it('preserves custom compound content while Astryx owns the layer', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Dropdown options={[]} onChange={onChange}>
      <Dropdown.Trigger>Custom trigger</Dropdown.Trigger>
      <Dropdown.Menu><Dropdown.Item value="a">Custom option</Dropdown.Item></Dropdown.Menu>
    </Dropdown>)
    await user.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Custom option', hidden: true }))
    expect(onChange).toHaveBeenCalledWith('a')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('dismisses the custom menu with Escape and restores its trigger', async () => {
    const user = userEvent.setup()
    render(<Dropdown options={[]}><Dropdown.Trigger>Choose</Dropdown.Trigger><Dropdown.Menu><Dropdown.Item value="a">Option</Dropdown.Item></Dropdown.Menu></Dropdown>)
    await user.click(screen.getByRole('combobox', { name: 'Choose' }))
    const option = screen.getByRole('option', { name: 'Option', hidden: true })
    // Astryx autofocus runs on the next animation frame. Wait for that work
    // before closing; manually focusing here races the pending autofocus.
    await waitFor(() => expect(option).toHaveFocus())
    await user.keyboard('{Escape}')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus())
  })
})
