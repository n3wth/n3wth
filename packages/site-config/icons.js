import { brandMarks } from './brand-marks.js'

export const iconColors = { background: '#08090b', foreground: '#ffffff' }
export const brandMarkPaths = [...brandMarks.white.matchAll(/<path[^>]+\/>/g)].map(match => match[0]).join('')

export const siteIcons = Object.fromEntries(Object.entries({ portfolio: 'n3wth', garden: 'Garden', r3: 'r3', skills: 'Skills', ui: 'UI' })
  .map(([site, name]) => [site, { name, symbol: 'Newth', paths: brandMarkPaths }]))

export function siteIconSvg(site, { background = true, variant = 'white' } = {}) {
  const icon = siteIcons[site]
  if (!icon) throw new Error(`Unknown site: ${site}`)
  if (!['black', 'white'].includes(variant)) throw new Error(`Unknown mark variant: ${variant}`)
  const svg = brandMarks[background ? 'contained' : variant]
  return svg.replace(/(<svg[^>]*>)/, `$1<title>${icon.name}</title>`)
}
