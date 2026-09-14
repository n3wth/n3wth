import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export function createSite(root, slug, title = slug) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug ?? '')) {
    throw new Error('Use a lowercase site name containing letters, numbers and hyphens.')
  }
  const destination = resolve(root, 'apps', slug)
  if (existsSync(destination)) throw new Error(`apps/${slug} already exists; nothing was changed.`)
  for (const directory of ['apps', 'packages']) {
    for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true })) {
      const path = resolve(root, directory, entry.name, 'package.json')
      if (entry.isDirectory() && existsSync(path) && JSON.parse(readFileSync(path, 'utf8')).name === `@n3wth/${slug}`) {
        throw new Error(`Workspace @n3wth/${slug} already exists; nothing was changed.`)
      }
    }
  }
  const ui = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'))
  const portfolio = JSON.parse(readFileSync(resolve(root, 'apps/portfolio/package.json'), 'utf8'))
  const pick = names => Object.fromEntries(names.map(name => [name, portfolio.dependencies?.[name] ?? portfolio.devDependencies?.[name]]))
  const manifest = {
    name: `@n3wth/${slug}`, private: true, version: '0.0.0', type: 'module',
    engines: { node: '24.x' },
    scripts: { dev: 'vite', build: 'tsc --noEmit && vite build', check: 'npm run build', preview: 'vite preview' },
    dependencies: { '@n3wth/ui': ui.version, ...pick(['react', 'react-dom']) },
    devDependencies: pick(['@types/react', '@types/react-dom', '@vitejs/plugin-react', 'typescript', 'vite']),
  }
  const htmlTitle = title.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
  const files = {
    'package.json': JSON.stringify(manifest, null, 2) + '\n',
    'vercel.json': JSON.stringify({ installCommand: 'cd ../.. && npx --yes npm@11.19.1 ci', buildCommand: `cd ../.. && npm run build --workspace @n3wth/ui && npm run build --workspace @n3wth/${slug}`, outputDirectory: 'dist' }, null, 2) + '\n',
    'index.html': `<!doctype html>\n<html lang="en" data-astryx-theme="n3wth" data-theme="dark"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="color-scheme" content="dark"/><meta name="robots" content="noindex"/><title>${htmlTitle}</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`,
    'vite.config.ts': "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({ plugins: [react()] })\n",
    'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true, noEmit: true }, include: ['src'] }, null, 2) + '\n',
    'src/main.tsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { N3wthProvider, PageHeader, SiteContainer, SiteSection, SiteHeading, SiteText, SiteNavigation, SiteFooter } from '@n3wth/ui/site'
import '@n3wth/ui/site.css'
import './styles.css'

const title = ${JSON.stringify(title)}
document.title = title

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <N3wthProvider mode="dark">
      <SiteNavigation brand={<a href="/">{title}</a>} links={<a href="#start">Start here</a>} />
      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title={title} description="A new idea, built with the shared site system." />
        <SiteSection id="start">
          <SiteHeading variant="section">Start here</SiteHeading>
          <SiteText>Replace this introduction with the problem this site helps people solve.</SiteText>
        </SiteSection>
      </SiteContainer>
      <SiteFooter />
    </N3wthProvider>
  </StrictMode>,
)
`,
    'src/styles.css': 'body { margin: 0; }\n',
    'AGENTS.md': '# Site conventions\n\nRead ../../AGENTS.md, ../../design.md and ../../style.md before UI work. Use @n3wth/ui/site and one complete shared stylesheet. Keep the workspace UI version aligned and use the root lockfile with Node 24. Build shared UI before this app. Preserve semantic headings, keyboard focus, reduced motion and usable touch targets. Verify first-paint theme, route scroll behavior and relevant shared patterns in a browser. Starter content is noindex: configure canonical/social metadata, sitemap and real content before making it indexable.\n',
    'README.md': `# ${title}\n\nGenerated from the shared Astryx site foundation.\n\nFrom the repository root:\n\n\`\`\`sh\nnpm install\nnpm run build --workspace @n3wth/ui\nnpm run dev --workspace @n3wth/${slug}\nnpm run check --workspace @n3wth/${slug}\n\`\`\`\n\nReplace starter copy before publishing. Configure a Vercel project with root directory apps/${slug}, root-workspace installation, and the app build command. Creating this directory does not create a deployment or domain.\n`,
  }
  for (const [name, content] of Object.entries(files)) {
    const path = resolve(destination, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content, { flag: 'wx' })
  }
  return destination
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(createSite(fileURLToPath(new URL('../', import.meta.url)), process.argv[2], process.argv.slice(3).join(' ') || process.argv[2]))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
