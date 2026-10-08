// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from '../../../proxy'
import { getSessionFromHeaders } from './auth'

vi.mock('./auth', () => ({ getSessionFromHeaders: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

it('redirects unauthenticated create requests to the login prompt', async () => {
  vi.mocked(getSessionFromHeaders).mockResolvedValue(null)
  const response = await proxy(new NextRequest('https://skills.n3wth.com/create'))
  expect(response.headers.get('location')).toBe('https://skills.n3wth.com/?login=required')
  expect(getSessionFromHeaders).not.toHaveBeenCalled()
})

it('redirects unrelated cookies without initializing unconfigured authentication', async () => {
  vi.mocked(getSessionFromHeaders).mockRejectedValue(new Error('Auth configuration missing'))
  const response = await proxy(new NextRequest('https://skills.n3wth.com/create', { headers: { cookie: 'analytics=one' } }))
  expect(response.headers.get('location')).toBe('https://skills.n3wth.com/?login=required')
  expect(getSessionFromHeaders).not.toHaveBeenCalled()
})

it('uses the Better Auth session cookie to admit authenticated create requests', async () => {
  vi.mocked(getSessionFromHeaders).mockResolvedValue({ user: { id: 'one' } } as never)
  const request = new NextRequest('https://skills.n3wth.com/create', { headers: { cookie: 'better-auth.session_token=signed-token' } })
  expect((await proxy(request)).headers.get('x-middleware-next')).toBe('1')
  expect(getSessionFromHeaders).toHaveBeenCalledWith(request.headers)
})
