import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'

export const PREVIEW_APPS = new Set(['ui-docs', 'portfolio', 'garden', 'kit', 'skills', 'r3-web'])
const STATIC_APPS = new Set(['ui-docs'])
const PREVIEW_SUFFIX = 'preview.n3wth.com'
const STATEFUL_BINDINGS = ['d1_databases', 'r2_buckets', 'kv_namespaces']

export function previewIdentity(app, pr) {
  if (!PREVIEW_APPS.has(app)) throw new Error(`Unsupported preview app: ${app}`)
  if (!Number.isSafeInteger(pr) || pr < 1) throw new Error('PR must be a positive safe integer.')
  return {
    workerName: `n3wth-${app}-pr-${pr}`,
    host: `${app}-pr-${pr}.${PREVIEW_SUFFIX}`,
  }
}

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
      } else output += ' '
      continue
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false
        output += '  '
        index += 1
      } else output += character === '\n' ? '\n' : ' '
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
    } else output += character
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

function absolutePath(path, sourcePath) {
  return isAbsolute(path) ? path : resolve(dirname(sourcePath), path)
}

function absoluteWasmModules(wasmModules, sourcePath) {
  if (!wasmModules) return undefined
  return Object.fromEntries(Object.entries(wasmModules).map(([name, path]) => [name, absolutePath(path, sourcePath)]))
}

function previewStatefulBindings(source, previewBindings) {
  const output = {}
  for (const type of STATEFUL_BINDINGS) {
    const sourceBindings = source[type] || []
    if (sourceBindings.length === 0) continue
    const provided = previewBindings?.[type]
    if (!Array.isArray(provided)) {
      throw new Error(`${type} must use explicit per-preview bindings; production bindings cannot be copied.`)
    }
    const sourceNames = new Set(sourceBindings.map(binding => binding.binding))
    const providedNames = new Set(provided.map(binding => binding.binding))
    for (const name of sourceNames) {
      if (!providedNames.has(name)) throw new Error(`Missing per-preview ${type} binding: ${name}`)
    }
    output[type] = structuredClone(provided)
  }
  return output
}

function previewServices(services, workerName) {
  if (!services) return undefined
  return services.map(service => service.binding === 'WORKER_SELF_REFERENCE'
    ? { ...service, service: workerName }
    : structuredClone(service))
}

export function createPreviewConfig({ source, sourcePath, root, app, pr, accountId, previewBindings, assetsDirectory }) {
  const identity = previewIdentity(app, pr)
  const paths = previewPaths({ root, app, pr })
  const config = structuredClone(source)
  config.name = identity.workerName
  config.account_id = accountId
  config.workers_dev = false
  config.preview_urls = false
  config.routes = [{ pattern: identity.host, custom_domain: true }]
  delete config.route
  if (config.assets?.directory) config.assets = { ...config.assets, directory: absolutePath(config.assets.directory, sourcePath) }
  if (config.wasm_modules) config.wasm_modules = absoluteWasmModules(config.wasm_modules, sourcePath)
  if (config.main) config.main = absolutePath(config.main, sourcePath)
  Object.assign(config, previewStatefulBindings(source, previewBindings))
  if (config.services) config.services = previewServices(config.services, identity.workerName)
  if (assetsDirectory) config.assets = { ...config.assets, directory: assetsDirectory }
  if (!STATIC_APPS.has(app)) {
    if (!config.main) throw new Error(`Dynamic preview ${app} requires a Worker main entrypoint.`)
    config.main = paths.wrapperPath
  }
  return { config, identity, paths, originalMain: source.main ? absolutePath(source.main, sourcePath) : undefined }
}

export function previewPaths({ root, app, pr }) {
  const identity = previewIdentity(app, pr)
  const directory = join(root, '.cloudflare', `${app}-pr-${pr}`)
  return {
    directory,
    configPath: join(directory, 'wrangler.json'),
    wrapperPath: join(directory, 'preview-noindex-worker.mjs'),
    ...identity,
  }
}

export function noindexWrapper(sourceMain) {
  return `import worker from ${JSON.stringify(sourceMain)}\n\nexport default {\n  async fetch(request, env, ctx) {\n    const response = await worker.fetch(request, env, ctx)\n    const headers = new Headers(response.headers)\n    headers.set('X-Robots-Tag', 'noindex, nofollow')\n    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })\n  },\n}\n`
}

export function writePreviewConfig({ root, app, pr, sourcePath, accountId, previewBindings, assetsDirectory }) {
  if (!existsSync(sourcePath)) throw new Error(`Missing Wrangler config: ${sourcePath}`)
  const source = parseJsonc(readFileSync(sourcePath, 'utf8'))
  const generated = createPreviewConfig({ source, sourcePath, root, app, pr, accountId, previewBindings, assetsDirectory })
  mkdirSync(generated.paths.directory, { recursive: true })
  if (generated.originalMain && !STATIC_APPS.has(app)) writeFileSync(generated.paths.wrapperPath, noindexWrapper(generated.originalMain))
  writeFileSync(generated.paths.configPath, `${JSON.stringify(generated.config, null, 2)}\n`)
  return generated
}
