import { readFileSync, realpathSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const version = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8')).version
const canonical = realpathSync(resolve(root, 'packages/ui/dist/site.css'))
const sites = new Set(['garden', 'kit', 'portfolio', 'r3-web', 'skills', 'ui-docs'])
function checkImports(directory, shared = new Set()) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'dist-demo', '.next', '.git', 'content', 'public'].includes(entry.name)) continue
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) checkImports(path, shared)
    else if (/\.(?:[cm]?[jt]sx?|css|scss|mdx)$/.test(entry.name)) {
      const source = readFileSync(path, 'utf8')
      if (/\.(?:css|scss)$/.test(entry.name) && /\.n3wth-site-[\w-]+/.test(source.replace(/\/\*[\s\S]*?\*\//g, ''))) {
        throw new Error(`${path}: shared site selectors belong in packages/ui, not app overrides`)
      }
      if (!/\.(test|spec)\./.test(entry.name)) {
        for (const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]@n3wth\/ui\/site['"]/g)) {
          for (const symbol of match[1].split(',')) shared.add(symbol.trim().split(/\s+/)[0])
        }
        if (source.includes('@n3wth/ui/site.css')) shared.add('site.css')
      }
      if (/(?:from\s*|import\s*|require\s*\(|import\s*\(|@import\s*)['"]@astryxdesign\//.test(source)) {
        throw new Error(`${path}: import primitives and styles through @n3wth/ui`)
      }
    }
  }
  return shared
}
for (const entry of readdirSync(resolve(root, 'apps'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const manifest = resolve(root, 'apps', entry.name, 'package.json')
  const app = JSON.parse(readFileSync(manifest, 'utf8'))
  for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    if (Object.keys(app[group] || {}).some(name => name.startsWith('@astryxdesign/'))) {
      throw new Error(`${app.name}: Astryx dependencies belong in @n3wth/ui`)
    }
  }
  const shared = checkImports(resolve(root, 'apps', entry.name))
  if (!app.dependencies?.['@n3wth/ui']) {
    if (sites.has(entry.name)) throw new Error(`${app.name} is missing the shared UI dependency`)
    continue
  }
  if (app.dependencies['@n3wth/ui'] !== version) throw new Error(`${app.name} must use workspace UI ${version}`)
  for (const component of ['N3wthProvider', 'SiteNavigation', 'PageHeader', 'SiteSection', 'SiteFooter', 'site.css']) {
    if (sites.has(entry.name) && !shared.has(component)) throw new Error(`${app.name} must consume shared ${component}`)
  }
  const resolved = realpathSync(createRequire(manifest).resolve('@n3wth/ui/site.css'))
  if (resolved !== canonical) throw new Error(`${app.name} resolves a separate UI package: ${resolved}`)
  console.log(`${app.name}: shared site foundation verified`)
}
