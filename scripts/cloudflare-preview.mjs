import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PREVIEW_APPS,
  parseJsonc,
  previewIdentity,
  previewPaths,
  writePreviewConfig,
} from './cloudflare-preview-config.mjs'
import { verifyPreviewReadiness } from './cloudflare-preview-verify.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const APP_ROOT = join(ROOT, 'apps', 'ui-docs')
const WRANGLER_ENTRYPOINT = resolve(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'
const STATIC_STAGE_APPS = new Set(['ui-docs', 'portfolio'])

export { parseJsonc, previewIdentity }

export function parseCliArgs(args) {
  const [action, ...options] = args
  if (!['config', 'deploy', 'delete'].includes(action)) {
    throw new Error('Action must be config, deploy, or delete.')
  }
  const values = { action, app: undefined, pr: undefined, bindings: undefined }
  for (let index = 0; index < options.length; index += 1) {
    const option = options[index]
    if (option !== '--app' && option !== '--pr' && option !== '--bindings-json') {
      throw new Error(`Unknown option: ${option}`)
    }
    const key = option === '--bindings-json' ? 'bindings' : option.slice(2)
    if (values[key] !== undefined) throw new Error(`Duplicate option: ${option}`)
    const value = options[++index]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${option}.`)
    values[key] = value
  }
  if (!PREVIEW_APPS.has(values.app)) {
    throw new Error(`App must be one of: ${[...PREVIEW_APPS].join(', ')}.`)
  }
  if (!/^[1-9]\d*$/.test(values.pr || '')) throw new Error('PR must be a positive integer.')
  const pr = Number(values.pr)
  if (!Number.isSafeInteger(pr) || pr < 1) throw new Error('PR must be a positive safe integer.')
  let bindings
  if (values.bindings !== undefined) {
    try {
      bindings = JSON.parse(values.bindings)
    } catch {
      throw new Error('--bindings-json must be a JSON object of per-preview bindings.')
    }
    if (!bindings || Array.isArray(bindings) || typeof bindings !== 'object') {
      throw new Error('--bindings-json must be a JSON object of per-preview bindings.')
    }
  }
  return { action, app: values.app, pr, ...(bindings ? { bindings } : {}) }
}

export function appRootPath(root = ROOT, app) {
  if (!PREVIEW_APPS.has(app)) throw new Error(`Unsupported preview app: ${app}`)
  return join(root, 'apps', app)
}

export function accountIdFromEnv(env = process.env) {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  if (!/^[a-f0-9]{32}$/i.test(accountId || '')) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID must be a 32-character hexadecimal ID.')
  }
  return accountId
}

function zoneIdFromEnv(env = process.env) {
  const zoneId = env.CLOUDFLARE_ZONE_ID
  if (!/^[a-f0-9]{32}$/i.test(zoneId || '')) {
    throw new Error('CLOUDFLARE_ZONE_ID must be a 32-character hexadecimal ID.')
  }
  return zoneId
}

export function findWranglerConfig(appRoot = APP_ROOT) {
  for (const name of ['wrangler.jsonc', 'wrangler.json']) {
    const path = join(appRoot, name)
    if (existsSync(path)) return path
  }
  throw new Error(`No Wrangler JSON or JSONC config found in ${appRoot}.`)
}

export function readAppConfig(appRoot = APP_ROOT) {
  const path = findWranglerConfig(appRoot)
  return { path, config: parseJsonc(readFileSync(path, 'utf8')) }
}

function absoluteConfigPath(value, configPath) {
  return isAbsolute(value) ? value : resolve(dirname(configPath), value)
}

export function injectPreviewHeaders(assetDirectory) {
  const headersPath = join(assetDirectory, '_headers')
  const existing = existsSync(headersPath) ? readFileSync(headersPath, 'utf8') : ''
  const marker = 'X-Robots-Tag: noindex, nofollow'
  if (existing.toLowerCase().includes(marker.toLowerCase())) return headersPath
  const newline = existing.includes('\r\n') ? '\r\n' : '\n'
  const lines = existing.split(/\r?\n/)
  const globalIndex = lines.findIndex(line => line.trim() === '/*')
  if (globalIndex === -1) {
    const separator = existing && !existing.endsWith('\n') ? newline : ''
    writeFileSync(headersPath, `${existing}${separator}/*${newline}  ${marker}${newline}`)
    return headersPath
  }
  let endIndex = globalIndex + 1
  while (endIndex < lines.length && lines[endIndex].trim() && !(lines[endIndex].trim().startsWith('/') && lines[endIndex].trim() !== '/*')) endIndex += 1
  lines.splice(endIndex, 0, `  ${marker}`)
  writeFileSync(headersPath, lines.join(newline))
  return headersPath
}

export function stagePreviewAssets({ sourceDirectory, stageDirectory }) {
  rmSync(stageDirectory, { recursive: true, force: true })
  mkdirSync(stageDirectory, { recursive: true })
  cpSync(sourceDirectory, stageDirectory, { recursive: true })
  injectPreviewHeaders(stageDirectory)
  return stageDirectory
}

function stagePreviewAppAssets({ app, appRoot, source, sourcePath, stageDirectory }) {
  if (!STATIC_STAGE_APPS.has(app)) return undefined
  const sourceAssets = absoluteConfigPath(source.assets?.directory || 'dist', sourcePath)
  rmSync(stageDirectory, { recursive: true, force: true })
  mkdirSync(stageDirectory, { recursive: true })
  cpSync(sourceAssets, stageDirectory, { recursive: true })
  if (app === 'portfolio') {
    for (const name of ['_headers', '_redirects']) {
      const from = join(appRoot, 'public', name)
      if (existsSync(from)) cpSync(from, join(stageDirectory, name))
    }
  }
  injectPreviewHeaders(stageDirectory)
  return stageDirectory
}

export function runWrangler(args, { cwd = ROOT, env = process.env, run = spawnSync } = {}) {
  return run(process.execPath, [WRANGLER_ENTRYPOINT, ...args], {
    cwd,
    env,
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

export function isMissingWorkerResult(result) {
  const text = `${result?.stdout || ''}\n${result?.stderr || ''}`.toLowerCase()
  if (/authentication|unauthorized|forbidden|invalid api token|api token|network|timed out|econn|fetch failed/.test(text)) return false
  return /worker[^\n]*(not found|does not exist)|not found[^\n]*worker|no worker found|10007/.test(text)
}

function assertCommandSucceeded(result, action) {
  if (result.error) throw new Error(`${action} failed: ${result.error.message}`)
  if (result.status !== 0) {
    const detail = commandOutput(result) || `exit ${result.status}`
    throw new Error(`${action} failed: ${detail}`)
  }
}

function redactSecrets(text) {
  return text.replace(/(authorization\s*:\s*bearer\s+|bearer\s+|api[_ -]?token\s*[:=]\s*)\S+/gi, '$1[redacted]')
}

function commandOutput(result) {
  const output = [result?.stderr, result?.stdout].filter(Boolean).join('\n').trim()
  if (!output) return ''
  return redactSecrets(output).slice(0, 4000)
}

function apiTokenFromEnv(env) {
  if (!env.CLOUDFLARE_API_TOKEN) throw new Error('CLOUDFLARE_API_TOKEN is required for Cloudflare domain ownership checks.')
  return env.CLOUDFLARE_API_TOKEN
}

export async function cloudflareApi(path, { env = process.env, fetchFn = fetch, method = 'GET', requestBody } = {}) {
  let response
  try {
    response = await fetchFn(`${CLOUDFLARE_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiTokenFromEnv(env)}`,
        ...(requestBody !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(requestBody !== undefined ? { body: JSON.stringify(requestBody) } : {}),
    })
  } catch (error) {
    throw new Error(`Cloudflare API ${method} ${path} failed: ${error.message}`)
  }
  let body
  const raw = await response.text()
  if (!raw.trim()) {
    if (!response.ok) {
      const error = new Error(`Cloudflare API ${method} ${path} failed: HTTP ${response.status}`)
      error.status = response.status
      throw error
    }
    return undefined
  }
  try {
    body = JSON.parse(raw)
  } catch {
    throw new Error(`Cloudflare API ${method} ${path} returned invalid JSON (HTTP ${response.status}).`)
  }
  if (!response.ok || body.success !== true) {
    const message = body.errors?.map(error => error.message).filter(Boolean).join('; ') || `HTTP ${response.status}`
    const error = new Error(`Cloudflare API ${method} ${path} failed: ${message}`)
    error.status = response.status
    throw error
  }
  return body.result
}

export async function findPreviewDomain({ accountId, identity, env, fetchFn }) {
  const domains = await cloudflareApi(`/accounts/${accountId}/workers/domains?hostname=${encodeURIComponent(identity.host)}`, { env, fetchFn })
  const matches = domains.filter(domain => domain.hostname === identity.host)
  if (matches.length > 1) throw new Error(`Cloudflare returned multiple Worker Domains for ${identity.host}.`)
  return matches[0]
}

export function assertPreviewDomainOwnership(domain, identity) {
  if (!domain) return
  if (domain.hostname !== identity.host || domain.service !== identity.workerName || (domain.environment && domain.environment !== 'production')) {
    throw new Error(`Refusing to modify ${identity.host}: its Worker Domain is not owned by ${identity.workerName}.`)
  }
  if (!domain.id) throw new Error(`Refusing to modify ${identity.host}: its owned Worker Domain has no ID.`)
}

export async function assertNoDomainCollision({ accountId, identity, env = process.env, fetchFn = fetch }) {
  const domain = await findPreviewDomain({ accountId, identity, env, fetchFn })
  assertPreviewDomainOwnership(domain, identity)
  if (domain) return domain
  const records = await findPreviewDnsRecords({ identity, env, fetchFn })
  const foreign = records.filter(record => !(record.type === 'AAAA' && record.content === '100::'))
  if (foreign.length > 0) throw new Error(`Refusing to deploy ${identity.host}: an existing DNS record is not owned by this preview Worker.`)
  return undefined
}

export async function deployPreview({ appRoot = APP_ROOT, root = ROOT, env = process.env, run = spawnSync, log = console.log, pr, app = 'ui-docs', fetchFn = fetch, bindings, verifyDeployment = verifyPreviewReadiness }) {
  const accountId = accountIdFromEnv(env)
  const identity = previewIdentity(app, pr)
  const paths = previewPaths({ root, app, pr })
  const stageDirectory = join(paths.directory, 'assets')
  await assertNoDomainCollision({ accountId, identity, env, fetchFn })
  const { path: sourcePath, config: source } = readAppConfig(appRoot)
  const stagedAssets = stagePreviewAppAssets({ app, appRoot, source, sourcePath, stageDirectory })
  const generated = writePreviewConfig({ root, app, pr, sourcePath, accountId, previewBindings: bindings, assetsDirectory: stagedAssets })
  const result = runWrangler(['deploy', '--config', generated.paths.configPath], { cwd: root, env, run })
  assertCommandSucceeded(result, 'Wrangler deploy')
  await ensurePreviewDnsRecord({ identity, env, fetchFn })
  // A Wrangler upload only proves the script uploaded; confirm the host actually
  // resolves, serves TLS, and returns the noindex preview page before reporting success.
  const redirectCheck = app === 'ui-docs'
    // Workers Static Assets redirects do not apply the asset _headers file.
    ? { expectStatus: 301, expectLocation: 'https://n3wth.com/projects/ui', requireNoindex: false }
    : app === 'r3-web'
      ? { expectStatus: 308, expectLocation: 'https://n3wth.com/projects/r3' }
      : app === 'garden' ? { path: '/__health' } : {}
  if (verifyDeployment) await verifyDeployment({ host: generated.identity.host, fetchFn, log, ...redirectCheck })
  log(`Deployed ${generated.identity.workerName} at https://${generated.identity.host}`)
  return {
    directory: paths.directory,
    assetsDirectory: stagedAssets,
    configPath: generated.paths.configPath,
    workerName: generated.identity.workerName,
    host: generated.identity.host,
    sourcePath,
    config: generated.config,
    command: [process.execPath, WRANGLER_ENTRYPOINT, 'deploy', '--config', generated.paths.configPath],
  }
}

// Workers custom domains need a proxied DNS record to resolve; wrangler does not
// manage it in this setup, and the deploy token is deliberately limited to DNS:Edit
// + Workers Scripts, so DNS and script deletion go through the scoped REST API
// instead of wrangler (which also lists KV namespaces on delete).
export async function findPreviewDnsRecords({ identity, env, fetchFn }) {
  const records = await cloudflareApi(`/zones/${zoneIdFromEnv(env)}/dns_records?name=${encodeURIComponent(identity.host)}&per_page=100`, { env, fetchFn })
  return records.filter(record => record.name === identity.host)
}

export function assertPreviewDnsRecord(record, identity) {
  if (!(record.type === 'AAAA' && record.content === '100::')) {
    throw new Error(`Refusing to touch DNS record ${record.id} for ${identity.host}: expected AAAA 100::, got ${record.type} ${record.content}.`)
  }
}

export async function ensurePreviewDnsRecord({ identity, env, fetchFn }) {
  const records = await findPreviewDnsRecords({ identity, env, fetchFn })
  if (records.length > 0) {
    for (const record of records) assertPreviewDnsRecord(record, identity)
    return { created: false, records }
  }
  const record = await cloudflareApi(`/zones/${zoneIdFromEnv(env)}/dns_records`, {
    env,
    fetchFn,
    method: 'POST',
    requestBody: { type: 'AAAA', name: identity.host, content: '100::', proxied: true, comment: `preview ${identity.workerName}` },
  })
  return { created: true, records: [record] }
}

export async function deletePreviewDnsRecords({ identity, env, fetchFn }) {
  const records = await findPreviewDnsRecords({ identity, env, fetchFn })
  for (const record of records) {
    assertPreviewDnsRecord(record, identity)
    await cloudflareApi(`/zones/${zoneIdFromEnv(env)}/dns_records/${record.id}`, { env, fetchFn, method: 'DELETE' })
  }
  return records.length
}

export async function deleteWorkerScript({ accountId, identity, env, fetchFn }) {
  let response
  try {
    response = await fetchFn(`${CLOUDFLARE_API}/accounts/${accountId}/workers/scripts/${identity.workerName}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiTokenFromEnv(env)}` },
    })
  } catch (error) {
    throw new Error(`Cloudflare API DELETE worker ${identity.workerName} failed: ${error.message}`)
  }
  if (response.status === 404) return { deleted: false }
  const raw = await response.text()
  let body
  try {
    body = raw.trim() ? JSON.parse(raw) : undefined
  } catch {
    throw new Error(`Cloudflare API DELETE worker ${identity.workerName} returned invalid JSON (HTTP ${response.status}).`)
  }
  if (!response.ok || (body && body.success === false)) {
    const message = body?.errors?.map(error => error.message).filter(Boolean).join('; ') || `HTTP ${response.status}`
    throw new Error(`Cloudflare API DELETE worker ${identity.workerName} failed: ${redactSecrets(message)}`)
  }
  return { deleted: true }
}

export async function deletePreview({ root = ROOT, env = process.env, run = spawnSync, log = console.log, pr, app = 'ui-docs', fetchFn = fetch }) {
  const accountId = accountIdFromEnv(env)
  const identity = previewIdentity(app, pr)
  const domain = await findPreviewDomain({ accountId, identity, env, fetchFn })
  assertPreviewDomainOwnership(domain, identity)
  if (domain) {
    await cloudflareApi(`/accounts/${accountId}/workers/domains/${domain.id}`, { env, fetchFn, method: 'DELETE' })
  }
  const dnsDeleted = await deletePreviewDnsRecords({ identity, env, fetchFn })
  const { deleted } = await deleteWorkerScript({ accountId, identity, env, fetchFn })
  log(deleted ? `Deleted ${identity.workerName}.` : `${identity.workerName} was already absent.`)
  return {
    ...identity,
    missing: !deleted,
    domainDetached: Boolean(domain),
    dnsRecordsDeleted: dnsDeleted,
  }
}

export async function main(args = process.argv.slice(2), env = process.env) {
  const input = parseCliArgs(args)
  accountIdFromEnv(env)
  if (input.action === 'config') {
    const generated = writePreviewConfig({
      root: ROOT,
      app: input.app,
      pr: input.pr,
      sourcePath: findWranglerConfig(appRootPath(ROOT, input.app)),
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      previewBindings: input.bindings,
    })
    console.log(JSON.stringify({ configPath: generated.paths.configPath, workerName: generated.identity.workerName, host: generated.identity.host }, null, 2))
  } else if (input.action === 'deploy') {
    await deployPreview({ appRoot: appRootPath(ROOT, input.app), ...input, env })
  } else {
    await deletePreview({ ...input, env })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
