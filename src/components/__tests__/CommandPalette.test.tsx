import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
    // Start-here shows 5 items from Pages and Thinking groups
    expect(screen.getAllByRole('option').length).toBe(5)
    // The start-here items include Library as first option
    expect(screen.getByRole('option', { name: /Library/i })).toBeTruthy()

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

describe('CommandPalette AI search', () => {
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('does not show AI row for queries under 2 characters', () => {
    render(
      <MemoryRouter>
        <CommandPalette open onClose={noop} />
      </MemoryRouter>
    )
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'a' } })
    // No AI row (Thinking... or Ask AI) should appear for single-char queries
    // Use aria-live="polite" to find the AI status area specifically
    expect(screen.queryByText(/Thinking…/)).toBeNull()
    expect(screen.queryByText(/Ask AI about/)).toBeNull()
  })

  it('auto-triggers AI search after debounce for 2+ character queries', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        body: null,
        json: () => Promise.resolve({ answer: 'Test answer with [citation](https://example.com)' }),
      })
    )
    globalThis.fetch = mockFetch

    render(
      <MemoryRouter>
        <CommandPalette open onClose={noop} />
      </MemoryRouter>
    )
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'astryx' } })

    // Should trigger fetch after debounce period
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/search',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('astryx'),
          })
        )
      },
      { timeout: 1000 }
    )
  })

  it('aborts previous request when typing a new query', async () => {
    const abortSpy = vi.fn()

    class MockAbortController {
      signal = { aborted: false }
      abort = abortSpy
    }

    const OriginalAbortController = globalThis.AbortController
    globalThis.AbortController = MockAbortController as unknown as typeof AbortController

    let resolveFirst: (value: unknown) => void
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve
    })

    const mockFetch = vi.fn().mockImplementation(() => firstPromise)
    globalThis.fetch = mockFetch

    render(
      <MemoryRouter>
        <CommandPalette open onClose={noop} />
      </MemoryRouter>
    )
    const input = screen.getByRole('combobox')

    // Type first query
    fireEvent.change(input, { target: { value: 'astryx' } })

    // Wait for debounce and first fetch to start
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    }, { timeout: 1000 })

    // Type second query before first completes
    fireEvent.change(input, { target: { value: 'astryx g' } })

    // Wait for abort to be called
    await waitFor(() => {
      expect(abortSpy).toHaveBeenCalled()
    }, { timeout: 1000 })

    // Cleanup
    resolveFirst!({ ok: true, body: null, json: () => Promise.resolve({ answer: 'test' }) })
    globalThis.AbortController = OriginalAbortController
  })

  it('does not show the old Ask AI button', () => {
    render(
      <MemoryRouter>
        <CommandPalette open onClose={noop} />
      </MemoryRouter>
    )
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'astryx' } })

    // There should be no "Ask AI about" button - AI triggers automatically
    expect(screen.queryByText(/Ask AI about/)).toBeNull()
  })

  it('shows retry button only on error', async () => {
    const mockFetch = vi.fn().mockImplementation(() => Promise.reject(new Error('Network error')))
    globalThis.fetch = mockFetch

    render(
      <MemoryRouter>
        <CommandPalette open onClose={noop} />
      </MemoryRouter>
    )
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'astryx' } })

    // Use a function matcher since the apostrophe may be a curly quote
    await waitFor(
      () => {
        expect(screen.getByText((content) => content.includes('reach the answering service'))).toBeTruthy()
      },
      { timeout: 1000 }
    )

    expect(screen.getByRole('button', { name: /Retry/i })).toBeTruthy()
  })

  it('Enter fires AI search immediately', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        body: null,
        json: () => Promise.resolve({ answer: 'Test answer' }),
      })
    )
    globalThis.fetch = mockFetch

    render(
      <MemoryRouter>
        <CommandPalette open onClose={noop} />
      </MemoryRouter>
    )
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'astryx' } })
    // Press Enter immediately (before debounce completes)
    fireEvent.keyDown(input, { key: 'Enter' })

    // Should fire immediately
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalled()
      },
      { timeout: 500 }
    )
  })
})
