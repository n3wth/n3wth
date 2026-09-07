import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { socialCard, socialSize } from '../packages/site-config/social.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fonts = [
  { name: 'Geist', data: readFileSync(resolve(root, 'apps/garden/src/lib/og-fonts/Geist-Regular.ttf')), weight: 400, style: 'normal' },
  { name: 'Geist', data: readFileSync(resolve(root, 'apps/garden/src/lib/og-fonts/Geist-SemiBold.ttf')), weight: 600, style: 'normal' },
]
const cards = [
  ['portfolio', 'Oliver Newth', '', 'apps/portfolio/public/og-image.png'],
  ...['home', 'getting-started', 'theming', 'components', 'hooks', 'css-utilities'].map(slug => ['ui', slug === 'home' ? 'UI' : slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '), 'React components and design tokens', `apps/ui-docs/public/og/${slug}.png`]),
]
for (const [site, title, subtitle, output] of cards) {
  const svg = await satori(socialCard(createElement, { site, title, subtitle, fontFamily: 'Geist' }), { ...socialSize, fonts })
  mkdirSync(dirname(resolve(root, output)), { recursive: true })
  writeFileSync(resolve(root, output), new Resvg(svg).render().asPng())
  console.log(output)
}
