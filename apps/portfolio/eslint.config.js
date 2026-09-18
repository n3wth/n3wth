import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
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
  },
  {
    // Entry point (main.tsx) is the Vite bootstrap with no exports; the
    // thinking registry co-locates lazy component references with a metadata
    // array. Both are intentional — the rule was tightened in
    // eslint-plugin-react-refresh 0.5.x and now flags these patterns as errors.
    files: ['src/main.tsx', 'src/components/thinking/registry.tsx'],
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
