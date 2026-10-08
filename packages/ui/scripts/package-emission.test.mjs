import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'vite'
import { needsClientBoundary, packageEmission } from './package-emission.mjs'

test('client classification follows source behavior rather than filenames', () => {
  for (const code of [
    `/* comment */ 'use strict'; 'use client'; export const value = 1`,
    `import { useState as state } from 'react'; export function Counter() { return state(0) }`,
    `import React from 'react'; export const Context = React.createContext(null)`,
    `import * as React from 'react'; export class Boundary extends React.Component {}`,
    `import { Component as Base } from 'react'; export class Boundary extends Base {}`,
    `import { useTheme as theme } from './theme'; export function Toggle() { return theme() }`,
    `import { forwardRef } from 'react'; export const Input = forwardRef(() => null)`,
    `export function Button() { return <button onClick={() => {}}>Click</button> }`,
  ]) assert.equal(needsClientBoundary(code, 'new-component.tsx'), true, code)
})

test('barrels, server helpers, comments, strings and type-only imports remain server usable', () => {
  for (const code of [
    `export { useTheme } from './theme'; export { OGCard } from './og'`,
    `import type { Component } from 'react'; export const value = 'use client'`,
    `import { type Component } from 'react'; export const value = 1`,
    `// 'use client'\nexport const value = 'useEffect()'`,
    `import { createElement } from 'react'; export const OGCard = () => createElement('div')`,
    `import { cache, use } from 'react'; export const read = cache(value => use(value))`,
    `export function Server() { return <div>Static content</div> }`,
  ]) assert.equal(needsClientBoundary(code, 'server.tsx'), false, code)
})

test('emission keeps new client modules local, preserves directives and leaves optional peers tree-shakeable', async () => {
  const modules = {
    '/index.js': `export { Counter } from './new-name.js'; export { OGCard } from './og.js'; export { animation } from './animation.js'`,
    '/new-name.js': `import { useState as state } from 'react'; export function Counter() { return state(0) }`,
    '/og.js': `export function OGCard() { return 'server' }`,
    '/animation.js': `'use client'; import gsap from 'gsap'; export const animation = gsap.to`,
  }
  const { output } = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [{
      name: 'fixture',
      resolveId(id) { return id.startsWith('.') ? `/${id.slice(2)}` : id },
      load(id) { return modules[id] },
    }, packageEmission()],
    build: {
      write: false,
      minify: false,
      rolldownOptions: {
        input: '/index.js',
        preserveEntrySignatures: 'strict',
        external: ['react', 'gsap'],
        output: { format: 'es', preserveModules: true, entryFileNames: '[name].js' },
      },
    },
  })
  const chunks = Object.fromEntries(output.map(chunk => [chunk.fileName, chunk]))
  assert.match(chunks['new-name.js'].code, /^["']use client["'];/)
  assert.match(chunks['animation.js'].code, /^["']use client["'];/)
  assert.doesNotMatch(chunks['index.js'].code, /use client/)
  assert.doesNotMatch(chunks['og.js'].code, /use client/)
  assert.deepEqual(chunks['new-name.js'].imports, ['react'])
  assert.deepEqual(chunks['og.js'].imports, [])
  assert.deepEqual(chunks['animation.js'].imports, ['gsap'])
})
