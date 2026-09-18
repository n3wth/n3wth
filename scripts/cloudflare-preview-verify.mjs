// A successful Wrangler upload does not prove the host resolves, serves a valid
// certificate, and returns the expected page. This module makes a real HTTPS
// request against the deployed host and classifies each failure (DNS, TLS, HTTP
// status, missing preview header) on its own, retrying while the Worker custom
// domain and its proxied DNS record finish provisioning. Certificate validation
// stays on: a preview served over an invalid certificate must fail, not pass.
import { setTimeout as delay } from 'node:timers/promises'

const DEFAULT_ATTEMPTS = 10
const DEFAULT_DELAY_MS = 6000

export function classifyFetchError(error) {
  const code = `${error?.cause?.code || error?.code || ''}`.toUpperCase()
  const message = `${error?.message || ''} ${error?.cause?.message || ''}`.toLowerCase()
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN' || /getaddrinfo|dns/.test(message)) return 'dns'
  if (code.startsWith('ERR_TLS') || /certificate|self.signed|alt ?name|\bssl\b|unable to (?:get|verify)/.test(message)) return 'tls'
  return 'network'
}

export async function checkPreviewOnce({ host, path = '/', fetchFn = fetch, expectStatus = 200, requireNoindex = true }) {
  let response
  try {
    response = await fetchFn(`https://${host}${path}`, { redirect: 'manual', headers: { 'user-agent': 'n3wth-preview-readiness' } })
  } catch (error) {
    return { ok: false, failure: classifyFetchError(error), detail: error.message }
  }
  if (response.status !== expectStatus) {
    return { ok: false, failure: 'http', detail: `expected HTTP ${expectStatus}, got ${response.status}` }
  }
  if (requireNoindex) {
    const robots = response.headers.get('x-robots-tag') || ''
    if (!/noindex/i.test(robots)) {
      return { ok: false, failure: 'header', detail: `expected preview X-Robots-Tag noindex, got ${robots ? `"${robots}"` : 'no header'}` }
    }
  }
  return { ok: true, status: response.status }
}

export async function verifyPreviewReadiness({ attempts = DEFAULT_ATTEMPTS, delayMs = DEFAULT_DELAY_MS, sleep = delay, log = () => {}, ...check }) {
  if (!check.host) throw new Error('verifyPreviewReadiness requires a host.')
  if (!(Number.isInteger(attempts) && attempts >= 1)) throw new Error('attempts must be a positive integer.')
  const target = `https://${check.host}${check.path || '/'}`
  let last
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    last = await checkPreviewOnce(check)
    if (last.ok) return { ...last, attempts: attempt }
    if (attempt < attempts) {
      log(`Readiness check for ${target} not ready (${last.failure}: ${last.detail}); attempt ${attempt}/${attempts}.`)
      await sleep(delayMs)
    }
  }
  const error = new Error(`Readiness check failed for ${target} after ${attempts} attempts (${last.failure}: ${last.detail}).`)
  error.failure = last.failure
  throw error
}
