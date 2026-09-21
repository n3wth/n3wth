import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { setTimeout as sleep } from 'node:timers/promises'
import { parseCsv } from './neon-to-d1.mjs'
import { siteUrls } from '../packages/site-config/index.js'

const sourceOrigins = {
  home: siteUrls.home,
  skills: siteUrls.skills,
  garden: siteUrls.garden,
  r3: siteUrls.r3,
  ui: siteUrls.ui,
}
const sourceAliases = { portfolio: 'home', 'r3-web': 'r3', 'ui-docs': 'ui' }
const sources = Object.keys(sourceOrigins)
const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const normalized = value => typeof value === 'string' ? value.trim().toLowerCase() : ''
const verified = value => value === true || value === 'true'

export function parseInput(text, format = 'json') {
  let rows
  if (format === 'csv') {
    const [header, ...values] = parseCsv(text.replace(/^\uFEFF/, ''))
    if (!header) return []
    const keys = header.map(field => field.value)
    if (new Set(keys).size !== keys.length) throw new Error('Invalid input headers')
    rows = values.map(fields => {
      if (fields.length !== keys.length) throw new Error('Invalid input row')
      return Object.fromEntries(keys.map((key, index) => [key, fields[index].value]))
    })
  } else rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('Expected input records')
  return rows
}

function recordSource(row) {
  const source = sourceAliases[row.source] || row.source
  let fromUrl
  if (row.url) {
    try {
      const origin = new URL(row.url).origin
      fromUrl = sources.find(source => sourceOrigins[source] === origin)
    } catch { return null }
    if (!fromUrl) return null
  }
  if (source && !sources.includes(source)) return null
  if (source && fromUrl && source !== fromUrl) return null
  return source || fromUrl || null
}

export function planImport(rows, topicIds) {
  if (!topicIds || sources.some(source => typeof topicIds[source] !== 'string' || !topicIds[source].trim())) throw new Error('All five source topic IDs are required')
  if (new Set(sources.map(source => topicIds[source])).size !== sources.length) throw new Error('Source topics must be distinct')
  const counts = { inputRows: rows.length, ineligibleRows: 0, invalidRows: 0, ambiguousRows: 0, duplicateRows: 0, eligibleContacts: 0 }
  const personEmails = new Map()
  for (const row of rows) {
    if (row.event !== 'email_captured' || !row.person_id) continue
    const addresses = personEmails.get(row.person_id) || new Set()
    addresses.add(normalized(row.email))
    personEmails.set(row.person_id, addresses)
  }
  const contacts = new Map()
  for (const row of rows) {
    if (row.event !== 'email_captured') { counts.ineligibleRows++; continue }
    const email = normalized(row.email)
    if (!validEmail(email)) { counts.invalidRows++; continue }
    const source = recordSource(row)
    if (!row.person_id || !verified(row.provenance_verified) || personEmails.get(row.person_id)?.size !== 1 || !source) {
      counts.ambiguousRows++
      continue
    }
    const contact = contacts.get(email) || { email, topicIds: new Set() }
    if (contact.topicIds.has(topicIds[source])) counts.duplicateRows++
    contact.topicIds.add(topicIds[source])
    contacts.set(email, contact)
  }
  counts.eligibleContacts = contacts.size
  return { counts, contacts: [...contacts.values()].map(contact => ({ ...contact, topicIds: [...contact.topicIds].sort() })) }
}

export function createResendClient(apiKey, { fetchImpl = fetch, wait = sleep, intervalMs = 600 } = {}) {
  if (!apiKey) throw new Error('RESEND_API_KEY is required')
  async function request(path, method = 'GET', body) {
    // All calls are sequential and paced below the default two requests/second limit.
    for (let attempt = 0; attempt < 3; attempt++) {
      await wait(intervalMs)
      const response = await fetchImpl(`https://api.resend.com${path}`, {
        method,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(15000),
      })
      if (response.status === 429 || (method === 'GET' && response.status >= 500)) {
        const retry = Number(response.headers.get('Retry-After'))
        await wait(Math.min(60000, Math.max(1000 * 2 ** attempt, Number.isFinite(retry) ? retry * 1000 : 0)))
        continue
      }
      if (response.status === 404 && method === 'GET') return null
      if (!response.ok) throw new Error('Provider request failed')
      return response.json()
    }
    throw new Error('Provider retries exhausted')
  }
  const contactPath = email => `/contacts/${encodeURIComponent(email)}`
  async function list(path) {
    const result = []
    let after
    do {
      const page = await request(`${path}?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`)
      if (!Array.isArray(page?.data)) throw new Error('Invalid provider list')
      result.push(...page.data)
      if (!page.has_more) return result
      const next = page.data.at(-1)?.id
      if (!next || next === after) throw new Error('Invalid provider pagination')
      after = next
    } while (true)
  }
  return {
    isSuppressed: async email => (await request(`/suppressions/${encodeURIComponent(email)}`)) !== null,
    get: email => request(contactPath(email)),
    topics: email => list(`${contactPath(email)}/topics`),
    segments: email => list(`${contactPath(email)}/segments`),
    create: (email, topicIds) => request('/contacts', 'POST', { email, topics: topicIds.map(id => ({ id, subscription: 'opt_in' })) }),
    subscribeTopics: (email, topicIds) => request(`${contactPath(email)}/topics`, 'PATCH', { topics: topicIds.map(id => ({ id, subscription: 'opt_in' })) }),
    addSegment: (email, segmentId) => request(`${contactPath(email)}/segments/${encodeURIComponent(segmentId)}`, 'POST'),
  }
}

export async function runImport(plan, { client, segmentId, apply = false, liveCutoverConfirmed = false }) {
  if (!segmentId) throw new Error('Segment is required')
  if (apply && !liveCutoverConfirmed) throw new Error('Live cutover must be confirmed before import')
  const counts = { ...plan.counts, imported: 0, existing: 0, wouldImport: 0, wouldUpdate: 0, skippedSuppressed: 0, skippedUnsubscribed: 0, skippedTopicOptOut: 0, failed: 0 }
  for (const item of plan.contacts) {
    try {
      if (await client.isSuppressed(item.email)) { counts.skippedSuppressed++; continue }
      let contact = await client.get(item.email)
      const existed = contact !== null
      if (contact && typeof contact.unsubscribed !== 'boolean') throw new Error('Unknown subscription state')
      if (contact?.unsubscribed) { counts.skippedUnsubscribed++; continue }
      let topics = contact ? await client.topics(item.email) : []
      if (topics.some(topic => item.topicIds.includes(topic.id) && !['opt_in', 'opt_out'].includes(topic.subscription))) throw new Error('Unknown topic state')
      if (topics.some(topic => item.topicIds.includes(topic.id) && topic.subscription === 'opt_out')) { counts.skippedTopicOptOut++; continue }
      let segments = contact ? await client.segments(item.email) : []
      const missingTopics = item.topicIds.filter(id => !topics.some(topic => topic.id === id && topic.subscription === 'opt_in'))
      const missingSegment = !segments.some(segment => segment.id === segmentId)
      if (!apply) {
        if (!contact) counts.wouldImport++
        else if (missingTopics.length || missingSegment) counts.wouldUpdate++
        else counts.existing++
        continue
      }
      if (!contact) await client.create(item.email, item.topicIds)
      // Re-read before changing membership; never reset global or topic opt-outs.
      contact = await client.get(item.email)
      if (!contact || typeof contact.unsubscribed !== 'boolean') throw new Error('Unknown subscription state')
      if (contact.unsubscribed) { counts.skippedUnsubscribed++; continue }
      topics = await client.topics(item.email)
      if (topics.some(topic => item.topicIds.includes(topic.id) && !['opt_in', 'opt_out'].includes(topic.subscription))) throw new Error('Unknown topic state')
      if (topics.some(topic => item.topicIds.includes(topic.id) && topic.subscription === 'opt_out')) { counts.skippedTopicOptOut++; continue }
      const pendingTopics = item.topicIds.filter(id => !topics.some(topic => topic.id === id && topic.subscription === 'opt_in'))
      if (pendingTopics.length) await client.subscribeTopics(item.email, pendingTopics)
      segments = await client.segments(item.email)
      if (!segments.some(segment => segment.id === segmentId)) await client.addSegment(item.email, segmentId)
      contact = await client.get(item.email)
      topics = await client.topics(item.email)
      segments = await client.segments(item.email)
      if (contact?.unsubscribed !== false || !item.topicIds.every(id => topics.some(topic => topic.id === id && topic.subscription === 'opt_in')) || !segments.some(segment => segment.id === segmentId)) throw new Error('Confirmation failed')
      counts[existed ? 'existing' : 'imported']++
    } catch {
      // Provider error bodies and input records may contain addresses. Report only counts.
      counts.failed++
    }
  }
  return counts
}

async function main() {
  const { values } = parseArgs({ options: {
    input: { type: 'string' }, config: { type: 'string' }, 'check-provider': { type: 'boolean', default: false },
    apply: { type: 'boolean', default: false }, 'live-cutover-confirmed': { type: 'boolean', default: false },
  } })
  if (!values.input || !values.config) throw new Error('Input and configuration are required')
  const config = JSON.parse(await readFile(values.config, 'utf8'))
  const rows = parseInput(await readFile(values.input, 'utf8'), extname(values.input).toLowerCase() === '.csv' ? 'csv' : 'json')
  const plan = planImport(rows, config.topicIds)
  if (!values['check-provider'] && !values.apply) {
    console.log(JSON.stringify({ mode: 'offline-dry-run', ...plan.counts, providerStateChecked: false }))
    return
  }
  const counts = await runImport(plan, {
    client: createResendClient(process.env.RESEND_API_KEY), segmentId: config.segmentId,
    apply: values.apply, liveCutoverConfirmed: values['live-cutover-confirmed'],
  })
  console.log(JSON.stringify({ mode: values.apply ? 'apply' : 'provider-dry-run', ...counts }))
  if (counts.failed) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.error('Import stopped. Check private input, configuration, credentials, and provider availability. No input records are logged.')
    process.exitCode = 1
  })
}
