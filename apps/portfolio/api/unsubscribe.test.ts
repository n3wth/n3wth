import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createUnsubscribeUrl, handleUnsubscribeRequest } from './unsubscribe'

const contact = '11111111-1111-4111-8111-111111111111'
const topic = '22222222-2222-4222-8222-222222222222'
const secret = 'test-signing-secret-that-is-at-least-32-characters'
const env = { RESEND_API_KEY: 'test-key', RESEND_UNSUBSCRIBE_SECRET: secret, RESEND_TOPIC_IDS: JSON.stringify({ home: topic }) }

beforeEach(() => vi.stubGlobal('crypto', webcrypto))
afterEach(() => vi.unstubAllGlobals())

describe('signed unsubscribe', () => {
  it('leaves preferences unchanged on GET and exposes no email address', async () => {
    const url = await createUnsubscribeUrl(contact, topic, secret)
    const fetchImpl = vi.fn()
    const response = await handleUnsubscribeRequest(new Request(url), env, fetchImpl)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('method="post"')
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(url).not.toContain('@')
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')
  })

  it('supports one-click POST and opts out only the signed topic', async () => {
    const url = await createUnsubscribeUrl(contact, topic, secret)
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}'))
    const response = await handleUnsubscribeRequest(new Request(url, { method: 'POST', body: 'List-Unsubscribe=One-Click' }), env, fetchImpl)
    expect(response.status).toBe(200)
    expect(fetchImpl).toHaveBeenCalledOnce()
    expect(fetchImpl.mock.calls[0][0]).toBe(`https://api.resend.com/contacts/${contact}/topics`)
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ topics: [{ id: topic, subscription: 'opt_out' }] })
  })

  it('rejects forged and modified tokens without contacting the provider', async () => {
    const url = await createUnsubscribeUrl(contact, topic, secret)
    const token = new URL(url).searchParams.get('token')!
    const changed = token.replace(/^./, token[0] === 'A' ? 'B' : 'A')
    const fetchImpl = vi.fn()
    for (const bad of [changed, 'invalid', token + '.extra']) {
      const response = await handleUnsubscribeRequest(new Request(`https://n3wth.com/api/unsubscribe?token=${bad}`, { method: 'POST' }), env, fetchImpl)
      expect(response.status).toBe(400)
    }
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('rejects unknown topics even with an authentic signature', async () => {
    const url = await createUnsubscribeUrl(contact, '33333333-3333-4333-8333-333333333333', secret)
    const fetchImpl = vi.fn()
    expect((await handleUnsubscribeRequest(new Request(url, { method: 'POST' }), env, fetchImpl)).status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('allows the Plex topic without requiring website membership', async () => {
    const url = await createUnsubscribeUrl(contact, 'ad622614-9af0-4edb-846f-9e200c4bfa97', secret)
    expect((await handleUnsubscribeRequest(new Request(url), env, vi.fn())).status).toBe(200)
  })

  it('reports provider failures honestly and does not expose credentials', async () => {
    const url = await createUnsubscribeUrl(contact, topic, secret)
    const response = await handleUnsubscribeRequest(new Request(url, { method: 'POST' }), env, vi.fn().mockResolvedValue(new Response('{}', { status: 429 })))
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain(env.RESEND_API_KEY)
  })

  it('refuses weak configuration and unsupported methods', async () => {
    await expect(createUnsubscribeUrl(contact, topic, 'short')).rejects.toThrow()
    expect((await handleUnsubscribeRequest(new Request('https://n3wth.com/api/unsubscribe'), {}, vi.fn())).status).toBe(503)
    expect((await handleUnsubscribeRequest(new Request('https://n3wth.com/api/unsubscribe', { method: 'DELETE' }), env, vi.fn())).status).toBe(405)
  })
})
