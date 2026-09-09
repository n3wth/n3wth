import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
// @ts-expect-error Build helper is an ESM script.
import { buildStyles } from './scripts/build-styles.mjs'

export default defineConfig({
  plugins: [
    { name: 'package-styles', closeBundle: buildStyles },
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
      // Generate declaration files alongside modules for better tree-shaking
      rollupTypes: false,
    })
  ],
  build: {
    // Don't copy public/ (demo favicon, robots.txt, registry) into dist;
    // the npm package ships fonts via the "files" field instead.
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'og/index': resolve(__dirname, 'src/og/index.ts'),
        'site/index': resolve(__dirname, 'src/site/index.tsx'),
        'primitives/index': resolve(__dirname, 'src/primitives/index.ts'),
        'visuals/index': resolve(__dirname, 'src/visuals/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => id !== 'react/jsx-dev-runtime' && (
        /^(react|react-dom)(\/|$)/.test(id) || /^gsap(\/|$)/.test(id)
      ),
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          gsap: 'gsap',
        },
        // Preserve per-component module structure so consumers tree-shake
        // unused components (and their deps, e.g. gsap) instead of pulling
        // the whole barrel. preserveModulesRoot keeps the dist layout flat
        // (dist/atoms/... not dist/src/atoms/...) so the exports map resolves.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        // Ensure proper ESM output
        format: 'es',
        // Add banner for proper module resolution
        banner: (chunk) => `${['site/index', 'primitives/index', 'visuals/index'].includes(chunk.name) ? "'use client';\n" : ''}/* @n3wth/ui - Built on Astryx */`,
      },
      // Ensure external modules aren't bundled
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    cssCodeSplit: false,
    // Minify for production
    minify: 'esbuild',
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Target modern browsers only
    target: 'es2020',
  },
  resolve: {
    alias: {
      'react/jsx-dev-runtime': resolve(__dirname, 'src/utils/jsx-dev-runtime.js'),
      '@': resolve(__dirname, './src')
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['clsx', 'tailwind-merge'],
  },
})
