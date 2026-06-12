import { render, screen, waitFor } from '@testing-library/react'
import { Building } from '../Building'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the projects data to have a predictable set
vi.mock('../../../data/content', async () => {
  const actual = await vi.importActual('../../../data/content')
  return {
    ...actual,
    projects: [
      {
        id: 'test-project',
        name: 'Test Project',
        description: 'A test project',
        tech: ['React'],
        url: 'https://example.com',
        github: 'https://github.com/test/repo',
      },
    ],
  }
})

// Mock GSAP to avoid animation issues in tests
vi.mock('../../../lib/gsap', () => ({
  gsap: {
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    registerPlugin: vi.fn(),
    quickTo: vi.fn(() => vi.fn()),
    context: vi.fn(() => ({ revert: vi.fn() })),
  },
  ScrollTrigger: { refresh: vi.fn() },
  useGSAP: vi.fn(),
}))

describe('Building Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn())
  })

  it('hides stats when GitHub API fails', async () => {
    // Mock a failed API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    } as Response)

    render(<Building />)

    // Wait for the fetch to be called and state to update
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    }, { timeout: 2000 })

    // Stats row only renders with a positive star count, so failure shows nothing
    expect(screen.queryByText('—')).toBeNull()
  })

  it('shows actual stats when GitHub API succeeds', async () => {
    // Mock a successful API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stars: 42, forks: 12 }),
    } as Response)

    render(<Building />)

    await waitFor(() => {
      expect(screen.getByText('42')).toBeDefined()
      expect(screen.getByText('12')).toBeDefined()
    }, { timeout: 2000 })
  })
})
