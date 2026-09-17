import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { LinkProvider } from '@n3wth/ui/primitives'
import { StrictMode } from 'react'
import NotFound from '../NotFound'
import { RouterLink } from '../../components/RouterLink'

const track = vi.hoisted(() => vi.fn())

vi.mock('../../lib/analytics', () => ({ track }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function MissingRouteNavigator() {
  const navigate = useNavigate()

  return <button onClick={() => navigate('/another-missing-page')}>Next missing page</button>
}

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>
}

function renderNotFound(path = '/missing-page') {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <LinkProvider component={RouterLink}>
          <Routes>
            <Route path="/" element={<LocationProbe />} />
            <Route path="/work" element={<LocationProbe />} />
            <Route path="/contact" element={<LocationProbe />} />
            <Route
              path="*"
              element={
                <>
                  <NotFound />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </LinkProvider>
      </MemoryRouter>
    </StrictMode>,
  )
}

describe('NotFound recovery', () => {
  it('offers only the main recovery destinations', () => {
    renderNotFound()

    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'View work' })).toHaveAttribute('href', '/work')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('tracks one view in StrictMode and tracks fixed recovery destinations', () => {
    renderNotFound()

    expect(track).toHaveBeenCalledExactlyOnceWith('not_found_viewed', { source_page: '/404' })
  })

  it.each([
    ['Go home', 'home', '/'],
    ['View work', 'work', '/work'],
    ['Contact', 'contact', '/contact'],
  ] as const)('navigates to %s and tracks one recovery activation', async (label, destination, path) => {
    renderNotFound()

    fireEvent.click(screen.getByRole('link', { name: label }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(new RegExp(`^${path.replace('/', '\\/')}$`)))
    expect(track.mock.calls).toEqual([
      ['not_found_viewed', { source_page: '/404' }],
      ['not_found_recovery_clicked', { source_page: '/404', destination }],
    ])
  })

  it('tracks a new view when navigation reaches another missing route', async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/missing-page']}>
          <LinkProvider component={RouterLink}>
            <Routes>
              <Route
                path="*"
                element={
                  <>
                    <NotFound />
                    <MissingRouteNavigator />
                  </>
                }
              />
            </Routes>
          </LinkProvider>
        </MemoryRouter>
      </StrictMode>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next missing page' }))

    await waitFor(() => {
      expect(track.mock.calls.filter(([event]) => event === 'not_found_viewed')).toEqual([
        ['not_found_viewed', { source_page: '/404' }],
        ['not_found_viewed', { source_page: '/404' }],
      ])
    })
  })
})
