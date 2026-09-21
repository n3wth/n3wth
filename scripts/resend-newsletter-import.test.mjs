import test from 'node:test'
import assert from 'node:assert/strict'
import { createResendClient, parseInput, planImport, runImport } from './resend-newsletter-import.mjs'

const topicIds = { home: 'home', skills: 'skills', garden: 'garden', r3: 'r3', ui: 'ui' }
const record = overrides => ({ event: 'email_captured', person_id: 'person-1', email: 'reader@example.com', source: 'portfolio', provenance_verified: true, ...overrides })
const plan = rows => planImport(rows, topicIds)

function mockClient(initial = {}) {
  const contacts = new Map(Object.entries(initial).map(([email, value]) => [email, { unsubscribed: false, topics: [], segments: [], ...value }]))
  const calls = []
  const client = {
    isSuppressed: async email => Boolean(contacts.get(email)?.suppressed),
    get: async email => contacts.has(email) ? { unsubscribed: contacts.get(email).unsubscribed } : null,
    topics: async email => contacts.get(email).topics,
    segments: async email => contacts.get(email).segments,
    create: async (email, ids) => {
      calls.push('create')
      assert.equal(contacts.has(email), false)
      contacts.set(email, { unsubscribed: false, topics: ids.map(id => ({ id, subscription: 'opt_in' })), segments: [] })
    },
    subscribeTopics: async (email, ids) => {
      calls.push('topics')
      contacts.get(email).topics.push(...ids.map(id => ({ id, subscription: 'opt_in' })))
    },
    addSegment: async (email, id) => {
      calls.push('segment')
      contacts.get(email).segments.push({ id })
    },
  }
  return { client, calls, contacts }
}
const options = client => ({ client, segmentId: 'newsletter', apply: true, liveCutoverConfirmed: true })

test('input accepts JSON and quoted CSV; rejects malformed rows and headers', () => {
  assert.deepEqual(parseInput('[{"event":"email_captured"}]'), [{ event: 'email_captured' }])
  assert.deepEqual(parseInput('email,note\r\n"reader@example.com","comma, and ""quote"""\r\n', 'csv'), [{ email: 'reader@example.com', note: 'comma, and "quote"' }])
  assert.throws(() => parseInput('email,email\na,b', 'csv'))
  assert.throws(() => parseInput('email,note\na', 'csv'))
  assert.throws(() => parseInput('{}'))
})

test('plan normalizes and deduplicates while retaining verified source topics', () => {
  const result = plan([
    record({ email: ' Reader@Example.com ' }), record(),
    record({ source: undefined, url: 'https://skills.n3wth.com/path' }),
  ])
  assert.deepEqual(result.contacts, [{ email: 'reader@example.com', topicIds: ['home', 'skills'] }])
  assert.equal(result.counts.duplicateRows, 1)
  assert.equal(result.counts.eligibleContacts, 1)
})

test('plan excludes noncapture, invalid, ambiguous identity, unverified provenance and unknown sources', () => {
  const result = plan([
    record({ event: '$pageview' }),
    record({ person_id: 'invalid', email: 'invalid' }),
    record({ person_id: 'ambiguous', email: 'first@example.com' }),
    record({ person_id: 'ambiguous', email: 'second@example.com' }),
    record({ person_id: 'unverified', provenance_verified: false }),
    record({ person_id: 'unknown', source: 'other' }),
    record({ person_id: 'mismatch', url: 'https://skills.n3wth.com/' }),
    record({ person_id: 'preview', url: 'https://preview.workers.dev/' }),
    record({ person_id: 'missing', source: undefined }),
  ])
  assert.equal(result.contacts.length, 0)
  assert.equal(result.counts.ineligibleRows, 1)
  assert.equal(result.counts.invalidRows, 1)
  assert.equal(result.counts.ambiguousRows, 7)
})

test('dry-run checks provider state without writing', async () => {
  const { client, calls } = mockClient()
  const result = await runImport(plan([record()]), { client, segmentId: 'newsletter' })
  assert.equal(result.wouldImport, 1)
  assert.deepEqual(calls, [])
  await assert.rejects(runImport(plan([record()]), { client, segmentId: 'newsletter', apply: true }))
})

test('suppressed and globally unsubscribed contacts never change', async () => {
  for (const [state, counter] of [[{ suppressed: true }, 'skippedSuppressed'], [{ unsubscribed: true }, 'skippedUnsubscribed']]) {
    const { client, calls } = mockClient({ 'reader@example.com': state })
    const result = await runImport(plan([record()]), options(client))
    assert.equal(result[counter], 1)
    assert.deepEqual(calls, [])
  }
})

test('preserves existing topic opt_out, including indistinguishable inherited defaults', async () => {
  const { client, calls } = mockClient({ 'reader@example.com': { topics: [{ id: 'home', subscription: 'opt_out' }] } })
  const result = await runImport(plan([record()]), options(client))
  assert.equal(result.skippedTopicOptOut, 1)
  assert.deepEqual(calls, [])
})

test('creates active contacts with only verified topics, verifies membership, and reruns without duplicates', async () => {
  const { client, calls } = mockClient()
  const input = plan([record(), record()])
  const first = await runImport(input, options(client))
  assert.equal(first.imported, 1)
  assert.equal(first.failed, 0)
  assert.deepEqual(calls, ['create', 'segment'])
  const second = await runImport(input, options(client))
  assert.equal(second.existing, 1)
  assert.equal(second.imported, 0)
  assert.deepEqual(calls, ['create', 'segment'])
})

test('partial failure recovers membership on rerun without recreating contact', async () => {
  const { client, calls } = mockClient()
  const add = client.addSegment
  client.addSegment = async () => { throw new Error('private provider error reader@example.com') }
  const first = await runImport(plan([record()]), options(client))
  assert.equal(first.failed, 1)
  assert.equal(JSON.stringify(first).includes('reader@example.com'), false)
  client.addSegment = add
  const second = await runImport(plan([record()]), options(client))
  assert.equal(second.existing, 1)
  assert.equal(second.failed, 0)
  assert.deepEqual(calls, ['create', 'segment'])
})

test('provider suppression errors fail closed and processing continues for other contacts', async () => {
  const { client, calls } = mockClient()
  client.isSuppressed = async email => {
    if (email === 'reader@example.com') throw new Error('unavailable')
    return false
  }
  const result = await runImport(plan([record(), record({ person_id: 'other', email: 'other@example.com' })]), options(client))
  assert.equal(result.failed, 1)
  assert.equal(result.imported, 1)
  assert.deepEqual(calls, ['create', 'segment'])
})

test('unknown global state and failed confirmation never count as imported', async () => {
  const { client, calls } = mockClient({ 'reader@example.com': { unsubscribed: undefined } })
  assert.equal((await runImport(plan([record()]), options(client))).failed, 1)
  assert.deepEqual(calls, [])
  const unknownTopic = mockClient({ 'reader@example.com': { topics: [{ id: 'home' }] } })
  assert.equal((await runImport(plan([record()]), options(unknownTopic.client))).failed, 1)
  assert.deepEqual(unknownTopic.calls, [])
  const fresh = mockClient()
  fresh.client.addSegment = async () => {}
  assert.equal((await runImport(plan([record()]), options(fresh.client))).failed, 1)
})

test('REST client paces requests, honors retry-after, encodes email and paginates topics', async () => {
  const requests = []
  const waits = []
  const responses = [
    new Response('{}', { status: 429, headers: { 'Retry-After': '2' } }),
    new Response('{}', { status: 404 }),
    Response.json({ data: [{ id: 'first', subscription: 'opt_in' }], has_more: true }),
    Response.json({ data: [{ id: 'second', subscription: 'opt_out' }], has_more: false }),
  ]
  const client = createResendClient('test-key', {
    wait: async ms => { waits.push(ms) },
    fetchImpl: async (url, init) => { requests.push({ url, init }); return responses.shift() },
  })
  assert.equal(await client.isSuppressed('reader+test@example.com'), false)
  assert.equal((await client.topics('reader+test@example.com')).length, 2)
  assert.equal(waits.includes(2000), true)
  assert.equal(waits.filter(ms => ms === 600).length, 4)
  assert.equal(requests[0].url, 'https://api.resend.com/suppressions/reader%2Btest%40example.com')
  assert.match(requests.at(-1).url, /after=first$/)
})

test('REST client never writes global subscription state or retries uncertain writes', async () => {
  const requests = []
  const client = createResendClient('test-key', {
    wait: async () => {},
    fetchImpl: async (url, init) => { requests.push({ url, init }); return new Response('{}', { status: 503 }) },
  })
  await assert.rejects(client.create('reader@example.com', ['home']))
  assert.equal(requests.length, 1)
  assert.deepEqual(JSON.parse(requests[0].init.body), { email: 'reader@example.com', topics: [{ id: 'home', subscription: 'opt_in' }] })
})
