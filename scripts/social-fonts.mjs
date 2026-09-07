import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entries = [['Regular', 400], ['SemiBold', 600]].map(([name, weight]) => {
  const data = readFileSync(resolve(root, `apps/garden/src/lib/og-fonts/Geist-${name}.ttf`)).toString('base64')
  return `    { name: 'Geist', weight: ${weight}, style: 'normal', data: Uint8Array.from(atob('${data}'), character => character.charCodeAt(0)).buffer },`
})
writeFileSync(resolve(root, 'packages/site-config/social-fonts.js'), [
  '// Generated from the existing Garden Geist font assets. Do not edit by hand.',
  'let cached',
  'export function socialFonts() {',
  '  if (!cached) cached = [',
  ...entries,
  '  ]',
  '  return cached',
  '}',
  '',
].join('\n'))
