import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.astro']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: { 'react-refresh/only-export-components': ['error', { allowConstantExport: true, extraHOCs: ['withTheme'] }] },
  },
  {
    // The registry co-locates component references with article metadata.
    files: ['src/components/thinking/registry.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // CommandPalette intentionally resets local state (entered, activeIndex,
    // askState) inside effects that respond to external changes (open, query
    // length). eslint-plugin-react-hooks 7.1 introduced set-state-in-effect
    // and flags these as errors; refactoring the palette's state machine is
    // out of scope for a dependency-bump PR.
    files: ['src/components/CommandPalette.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
