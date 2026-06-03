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
    set: vi.fn(),
    registerPlugin: vi.fn(),
    quickTo: vi.fn(() => vi.fn()),
  },
  useGSAP: vi.fn(),
}))

describe('Building Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn())
  })

  it('shows dash fallback when GitHub API fails', async () => {
    // Mock a failed API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    } as Response)

    render(<Building />)

    // Wait for the fetch to be called and state to update
    await waitFor(() => {
      // Check for the dash fallback in the stats
      // We expect two dashes (one for stars, one for forks)
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(2)
    }, { timeout: 2000 })
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
