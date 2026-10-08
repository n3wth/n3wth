// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { executeAI, FreeLimitReachedError, InvalidApiKeyError } from './aiProvider'
import { getFingerprint } from './usageTracker'

vi.mock('./usageTracker', () => ({ getFingerprint: vi.fn(() => 'workflow-fingerprint') }))
const fetchMock = vi.fn()
const playground = { fingerprint: 'pg-existing-fingerprint', skillContext: { name: 'PDF', description: 'Read PDFs', features: ['Extract'], useCases: ['Invoices'] } }
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', fetchMock) })
afterEach(() => vi.unstubAllGlobals())

it('keeps the workflow endpoint, stored fingerprint and result contract', async () => {
  fetchMock.mockResolvedValue(Response.json({ result: 'Output', remaining: 2, model: 'test' }))
  expect(await executeAI('Prompt', { apiKey: 'own-key' })).toEqual({ result: 'Output', remaining: 2, model: 'test' })
  expect(fetchMock.mock.calls[0][0]).toBe('/api/ai/execute')
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ prompt: 'Prompt', userApiKey: 'own-key', fingerprint: 'workflow-fingerprint' })
})

it('sends playground context and existing identity without reading the workflow identity', async () => {
  fetchMock.mockResolvedValue(Response.json({ result: 'Output' }))
  await executeAI('Prompt', { playground })
  expect(fetchMock.mock.calls[0][0]).toBe('/api/playground')
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ prompt: 'Prompt', fingerprint: playground.fingerprint, skillContext: playground.skillContext })
  expect(getFingerprint).not.toHaveBeenCalled()
})

it.each([undefined, playground])('preserves typed quota and invalid-key errors (%j)', async mode => {
  fetchMock.mockResolvedValueOnce(Response.json({ message: 'Exhausted', limit: 3, used: 3 }, { status: 402 }))
  const error = await executeAI('Prompt', { playground: mode }).catch(error => error)
  expect(error).toBeInstanceOf(FreeLimitReachedError)
  expect(error).toMatchObject({ message: 'Exhausted', limit: 3, used: 3 })
  fetchMock.mockResolvedValueOnce(Response.json({ message: 'Rejected' }, { status: 401 }))
  await expect(executeAI('Prompt', { playground: mode })).rejects.toBeInstanceOf(InvalidApiKeyError)
})

it('keeps different existing generic failure messages and server error text', async () => {
  fetchMock.mockImplementation(async () => Response.json({}, { status: 502 }))
  await expect(executeAI('Prompt')).rejects.toThrow('AI execution failed')
  await expect(executeAI('Prompt', { playground })).rejects.toThrow('Request failed')
  fetchMock.mockResolvedValueOnce(Response.json({ error: 'Service unavailable' }, { status: 503 }))
  await expect(executeAI('Prompt', { playground })).rejects.toThrow('Service unavailable')
})
