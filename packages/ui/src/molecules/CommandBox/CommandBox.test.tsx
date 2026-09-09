import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommandBox } from './CommandBox'

const writeTextMock = vi.fn().mockResolvedValue(undefined)

describe('CommandBox', () => {
  beforeEach(() => {
    writeTextMock.mockClear()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })
  })

  it('renders the command text', () => {
    render(<CommandBox command="npm install @n3wth/ui" />)
    expect(screen.getByText('npm install @n3wth/ui')).toBeInTheDocument()
  })

  it('renders copy button by default', () => {
    render(<CommandBox command="npm install" />)
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  it('hides copy button when showCopyButton is false', () => {
    render(<CommandBox command="npm install" showCopyButton={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('transitions to copied state on click', async () => {
    const user = userEvent.setup()
    render(<CommandBox command="npm install @n3wth/ui" />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    // Verifies the clipboard copy was attempted and succeeded (shows Copied state)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('calls onCopy callback', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(<CommandBox command="npm install" onCopy={onCopy} />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('shows copied state after clicking copy', async () => {
    const user = userEvent.setup()
    render(<CommandBox command="npm install" />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied'))
  })

  it('applies primary variant', () => {
    const { container } = render(<CommandBox command="npm install" variant="primary" />)
    expect(container.firstChild).toHaveAttribute('data-variant', 'primary')
  })

  it('reports success only once clipboard writing resolves', async () => {
    let resolve!: () => void
    writeTextMock.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done }))
    const onCopy = vi.fn()
    render(<CommandBox command="npm install" onCopy={onCopy} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeTextMock).toHaveBeenCalledWith('npm install')
    expect(onCopy).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument()
    await act(async () => { resolve() })
    expect(onCopy).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('does not report success when clipboard access is denied', async () => {
    writeTextMock.mockRejectedValueOnce(new Error('Permission denied'))
    const onCopy = vi.fn()
    render(<CommandBox command="npm install" onCopy={onCopy} />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy code' })) })
    expect(onCopy).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })
})
