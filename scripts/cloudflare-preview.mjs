import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const APP_ROOT = join(ROOT, 'apps', 'ui-docs')
const APP_ALLOWLIST = new Set(['ui-docs'])
const PREVIEW_SUFFIX = 'preview.n3wth.com'
const WRANGLER_ENTRYPOINT = resolve(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'

export function parseJsonc(source) {
  let output = ''
  let quote = false
  let escaped = false
  let lineComment = false
  let blockComment = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const next = source[index + 1]
    if (lineComment) {
      if (character === '\n') {
        lineComment = false
        output += character
      } else {
        output += ' '
      }
      continue
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false
        output += '  '
        index += 1
      } else {
        output += character === '\n' ? '\n' : ' '
      }
      continue
    }
    if (quote) {
      output += character
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') quote = false
      continue
    }
    if (character === '"') {
      quote = true
      output += character
    } else if (character === '/' && next === '/') {
      lineComment = true
      output += '  '
      index += 1
    } else if (character === '/' && next === '*') {
      blockComment = true
      output += '  '
      index += 1
    } else {
      output += character
    }
  }
  let json = ''
  quote = false
  escaped = false
  for (let index = 0; index < output.length; index += 1) {
    const character = output[index]
    if (quote) {
      json += character
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') quote = false
      continue
    }
    if (character === '"') {
      quote = true
      json += character
      continue
    }
    if (character === ',') {
      let next = index + 1
      while (/\s/.test(output[next] || '')) next += 1
      if (output[next] === '}' || output[next] === ']') continue
    }
    json += character
  }
  return JSON.parse(json)
}

export function parseCliArgs(args) {
  const [action, ...options] = args
  if (!['config', 'deploy', 'delete'].includes(action)) {
    throw new Error('Action must be config, deploy, or delete.')
  }
  const values = { action, app: undefined, pr: undefined }
  for (let index = 0; index < options.length; index += 1) {
    const option = options[index]
    if (option !== '--app' && option !== '--pr') throw new Error(`Unknown option: ${option}`)
    if (values[option.slice(2)] !== undefined) throw new Error(`Duplicate option: ${option}`)
    const value = options[++index]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${option}.`)
    values[option.slice(2)] = value
  }
  if (!APP_ALLOWLIST.has(values.app)) throw new Error('App must be ui-docs.')
  if (!/^[1-9]\d*$/.test(values.pr || '')) throw new Error('PR must be a positive integer.')
  const pr = Number(values.pr)
  if (!Number.isSafeInteger(pr) || pr < 1) throw new Error('PR must be a positive safe integer.')
  return { action, app: values.app, pr }
}

export function previewIdentity(app, pr) {
  if (!APP_ALLOWLIST.has(app)) throw new Error('App must be ui-docs.')
  if (!Number.isSafeInteger(pr) || pr < 1) throw new Error('PR must be a positive safe integer.')
  return {
    workerName: `n3wth-${app}-pr-${pr}`,
    host: `${app}-pr-${pr}.${PREVIEW_SUFFIX}`,
  }
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

export function createGeneratedConfig({ source, sourcePath, accountId, identity, assetsDirectory }) {
  const config = structuredClone(source)
  config.name = identity.workerName
  config.account_id = accountId
  config.workers_dev = false
  config.preview_urls = false
  config.routes = [{ pattern: identity.host, custom_domain: true }]
  delete config.route
  if (config.main) config.main = absoluteConfigPath(config.main, sourcePath)
  if (config.assets) {
    config.assets = { ...config.assets, directory: assetsDirectory }
  } else {
    config.assets = { directory: assetsDirectory, not_found_handling: '404-page' }
  }
  return config
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

export function generatedPaths({ app = 'ui-docs', pr, root = ROOT }) {
  const identity = previewIdentity(app, pr)
  const directory = join(root, '.cloudflare', `${app}-pr-${pr}`)
  return {
    directory,
    assetsDirectory: join(directory, 'assets'),
    configPath: join(directory, 'wrangler.json'),
    ...identity,
  }
}

export function writeGeneratedConfig({ appRoot = APP_ROOT, root = ROOT, accountId, app = 'ui-docs', pr, assetsDirectory }) {
  const { path: sourcePath, config: source } = readAppConfig(appRoot)
  const paths = generatedPaths({ app, pr, root })
  const targetAssets = assetsDirectory || paths.assetsDirectory
  mkdirSync(paths.directory, { recursive: true })
  const generated = createGeneratedConfig({ source, sourcePath, accountId, identity: previewIdentity(app, pr), assetsDirectory: targetAssets })
  writeFileSync(paths.configPath, `${JSON.stringify(generated, null, 2)}\n`)
  return { ...paths, sourcePath, config: generated }
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

function commandOutput(result) {
  const output = [result?.stderr, result?.stdout].filter(Boolean).join('\n').trim()
  if (!output) return ''
  return output
    .replace(/(authorization\s*:\s*bearer\s+|bearer\s+|api[_ -]?token\s*[:=]\s*)\S+/gi, '$1[redacted]')
    .slice(0, 4000)
}

function apiTokenFromEnv(env) {
  if (!env.CLOUDFLARE_API_TOKEN) throw new Error('CLOUDFLARE_API_TOKEN is required for Cloudflare domain ownership checks.')
  return env.CLOUDFLARE_API_TOKEN
}

export async function cloudflareApi(path, { env = process.env, fetchFn = fetch, method = 'GET' } = {}) {
  let response
  try {
    response = await fetchFn(`${CLOUDFLARE_API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${apiTokenFromEnv(env)}` },
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
  const records = await cloudflareApi(`/zones/${zoneIdFromEnv(env)}/dns_records?name=${encodeURIComponent(identity.host)}&per_page=100`, { env, fetchFn })
  if (records.length > 0) throw new Error(`Refusing to deploy ${identity.host}: an existing DNS record is not owned by this preview Worker.`)
  return undefined
}

export async function deployPreview({ appRoot = APP_ROOT, root = ROOT, env = process.env, run = spawnSync, log = console.log, pr, app = 'ui-docs', fetchFn = fetch }) {
  const accountId = accountIdFromEnv(env)
  const paths = generatedPaths({ app, pr, root })
  await assertNoDomainCollision({ accountId, identity: previewIdentity(app, pr), env, fetchFn })
  const { path: sourcePath, config: source } = readAppConfig(appRoot)
  const sourceAssets = source.assets?.directory || join(dirname(sourcePath), 'dist')
  stagePreviewAssets({ sourceDirectory: absoluteConfigPath(sourceAssets, sourcePath), stageDirectory: paths.assetsDirectory })
  const generated = writeGeneratedConfig({ appRoot, root, accountId, app, pr, assetsDirectory: paths.assetsDirectory })
  const result = runWrangler(['deploy', '--config', generated.configPath], { cwd: root, env, run })
  assertCommandSucceeded(result, 'Wrangler deploy')
  log(`Deployed ${generated.workerName} at https://${generated.host}`)
  return { ...generated, command: [process.execPath, WRANGLER_ENTRYPOINT, 'deploy', '--config', generated.configPath] }
}

export async function deletePreview({ root = ROOT, env = process.env, run = spawnSync, log = console.log, pr, app = 'ui-docs', fetchFn = fetch }) {
  const accountId = accountIdFromEnv(env)
  const identity = previewIdentity(app, pr)
  const domain = await findPreviewDomain({ accountId, identity, env, fetchFn })
  assertPreviewDomainOwnership(domain, identity)
  if (domain) {
    await cloudflareApi(`/accounts/${accountId}/workers/domains/${domain.id}`, { env, fetchFn, method: 'DELETE' })
  }
  const result = runWrangler(['delete', identity.workerName, '--force'], { cwd: root, env: { ...env, CLOUDFLARE_ACCOUNT_ID: accountId }, run })
  if (result.error) throw new Error(`Wrangler delete failed: ${result.error.message}`)
  if (result.status !== 0 && !isMissingWorkerResult(result)) {
    const detail = commandOutput(result) || `exit ${result.status}`
    throw new Error(`Wrangler delete failed: ${detail}`)
  }
  log(result.status === 0 ? `Deleted ${identity.workerName}.` : `${identity.workerName} was already absent.`)
  return {
    ...identity,
    missing: result.status !== 0,
    domainDetached: Boolean(domain),
  }
}

export async function main(args = process.argv.slice(2), env = process.env) {
  const input = parseCliArgs(args)
  accountIdFromEnv(env)
  if (input.action === 'config') {
    const generated = writeGeneratedConfig({ accountId: env.CLOUDFLARE_ACCOUNT_ID, ...input })
    console.log(JSON.stringify({ configPath: generated.configPath, workerName: generated.workerName, host: generated.host }, null, 2))
  } else if (input.action === 'deploy') {
    await deployPreview({ ...input, env })
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
