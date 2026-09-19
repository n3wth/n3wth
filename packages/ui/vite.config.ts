import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
// @ts-expect-error Build helper is an ESM script.
import { buildStyles } from './scripts/build-styles.mjs'
// @ts-expect-error Build helper is an ESM script.
import { packageEmission } from './scripts/package-emission.mjs'

export default defineConfig({
  plugins: [
    packageEmission(),
    { name: 'package-styles', closeBundle: buildStyles },
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
      // Declaration generation already checks the TypeScript program. Fail the
      // build on diagnostics instead of checking the same sources twice.
      afterDiagnostic(diagnostics) {
        if (diagnostics.some(diagnostic => diagnostic.category === 1)) {
          throw new Error('UI TypeScript validation failed; see diagnostics above')
        }
      },
      // Generate declaration files alongside modules for better tree-shaking
      rollupTypes: false,
    })
  ],
  build: {
    // Consumers bundle these modules again; gzip reporting is not a package check.
    reportCompressedSize: false,
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
      // Ordinary runtime dependencies are bundled by the consuming app. Keep
      // Astryx internal so its development JSX calls pass through our shim.
      external: (id) => id !== 'react/jsx-dev-runtime' && (
        /^(react|react-dom|gsap|clsx|tailwind-merge|iconoir-react)(\/|$)/.test(id)
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
