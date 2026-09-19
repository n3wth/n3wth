import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'node:fs'
import { docPageMeta, docSource, renderDocumentationIndex } from './demo/docPages'

const docContentId = 'virtual:doc-content'
const resolvedDocContentId = `\0${docContentId}`

export default defineConfig(() => ({
  plugins: [
    {
      name: 'published-documentation',
      resolveId(id) {
        if (id === docContentId) return resolvedDocContentId
      },
      load(id) {
        if (id !== resolvedDocContentId) return
        const imports = docPageMeta.map((page, index) => {
          const source = resolve(__dirname, 'demo', docSource(page.slug))
          if (!existsSync(source)) {
            throw new Error(`Missing documentation content for "${page.slug}": expected "${source}".`)
          }
          return `import Doc${index} from ${JSON.stringify(source)};`
        })
        const modules = docPageMeta.map((page, index) =>
          `${JSON.stringify(docSource(page.slug))}: { default: Doc${index} }`)
        return `${imports.join('\n')}\nexport default { ${modules.join(', ')} };`
      },
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url?.split('?')[0] !== '/llms.txt') return next()
          const template = readFileSync(resolve(__dirname, 'public/llms.txt'), 'utf8')
          const index = renderDocumentationIndex(template)
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end(index)
        })
      },
    },
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
    }),
    react(),
    tailwindcss(),
  ],
  root: 'demo',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  },
  server: {
    port: 3333,
    open: true
  }
}))
