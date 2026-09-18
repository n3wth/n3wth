import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthProvider'

const {
  sessionState,
  mockSignInMagicLink,
  mockSignOut,
} = vi.hoisted(() => ({
  sessionState: { value: { data: null as unknown, isPending: false, error: null as unknown } },
  mockSignInMagicLink: vi.fn().mockResolvedValue({ data: {}, error: null }),
  mockSignOut: vi.fn().mockResolvedValue({ data: {}, error: null }),
}))

vi.mock('../lib/auth-client', () => ({
  authClient: {
    useSession: () => sessionState.value,
    signIn: { magicLink: mockSignInMagicLink },
    signOut: mockSignOut,
  },
}))

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'testuser',
    emailVerified: true,
    image: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

function TestConsumer() {
  const { user, profile, loading, error, signIn, signOut } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? 'authenticated' : 'none'}</span>
      <span data-testid="profile">{profile?.username ?? 'none'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button onClick={() => signIn('test@example.com')}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionState.value = { data: null, isPending: false, error: null }
    mockSignInMagicLink.mockResolvedValue({ data: {}, error: null })
    mockSignOut.mockResolvedValue({ data: {}, error: null })
  })

  it('starts in loading state', () => {
    sessionState.value = { data: null, isPending: true, error: null }
    render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('resolves to unauthenticated when no session', () => {
    render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('profile')).toHaveTextContent('none')
  })

  it('exposes the session user when signed in', () => {
    sessionState.value = { data: { user: makeUser(), session: {} }, isPending: false, error: null }
    render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('authenticated')
  })

  it('handles session error gracefully', () => {
    sessionState.value = { data: null, isPending: false, error: { message: 'Session expired' } }
    render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )
    expect(screen.getByTestId('error')).toHaveTextContent('Session expired')
  })

  it('calls signIn.magicLink on signIn', async () => {
    render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )

    await userEvent.click(screen.getByText('Sign In'))

    expect(mockSignInMagicLink).toHaveBeenCalledWith({
      email: 'test@example.com',
      callbackURL: '/',
    })
  })

  it('handles signIn error', async () => {
    mockSignInMagicLink.mockResolvedValue({
      data: null,
      error: { message: 'Magic link failed' },
    })

    render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )

    await userEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Magic link failed')
    })
  })

  it('clears user via the session hook on signOut', async () => {
    sessionState.value = { data: { user: makeUser(), session: {} }, isPending: false, error: null }
    const { rerender } = render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )
    expect(screen.getByTestId('user')).toHaveTextContent('authenticated')

    await userEvent.click(screen.getByText('Sign Out'))

    expect(mockSignOut).toHaveBeenCalled()
    // better-auth clears the session store after a successful sign-out;
    // the next useSession value flows into context.
    sessionState.value = { data: null, isPending: false, error: null }
    rerender(<AuthProvider><TestConsumer /></AuthProvider>)
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('profile')).toHaveTextContent('none')
  })

  it('handles signOut error and keeps the user signed in', async () => {
    sessionState.value = { data: { user: makeUser(), session: {} }, isPending: false, error: null }
    mockSignOut.mockResolvedValue({
      data: null,
      error: { message: 'Sign out failed' },
    })

    render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )

    await userEvent.click(screen.getByText('Sign Out'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Sign out failed')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('authenticated')
  })

  it('reflects a new session from the useSession hook', () => {
    const { rerender } = render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )
    expect(screen.getByTestId('user')).toHaveTextContent('none')

    sessionState.value = { data: { user: makeUser({ id: 'user-2' }), session: {} }, isPending: false, error: null }
    rerender(<AuthProvider><TestConsumer /></AuthProvider>)

    expect(screen.getByTestId('user')).toHaveTextContent('authenticated')
  })

  it('clears state when the session hook resolves to signed out', () => {
    sessionState.value = { data: { user: makeUser(), session: {} }, isPending: false, error: null }
    const { rerender } = render(
      <AuthProvider><TestConsumer /></AuthProvider>
    )
    expect(screen.getByTestId('user')).toHaveTextContent('authenticated')

    sessionState.value = { data: null, isPending: false, error: null }
    rerender(<AuthProvider><TestConsumer /></AuthProvider>)

    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('profile')).toHaveTextContent('none')
  })
})
