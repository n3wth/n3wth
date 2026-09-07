import { iconColors, siteIcons, siteIconSvg } from './icons.js'
export { socialFonts } from './social-fonts.js'

export const socialSize = { width: 1200, height: 630 }
const domains = { portfolio: 'n3wth.com', garden: 'garden.n3wth.com', skills: 'skills.n3wth.com', kit: 'kit.n3wth.com', r3: 'r3.n3wth.com', ui: 'ui.n3wth.com' }

// Inject createElement so this package stays independent of React versions.
export function socialCard(h, { site, title, subtitle = '', fontFamily = 'Geist' }) {
  const label = siteIcons[site].name
  const fontSize = title.length > 100 ? 44 : title.length > 65 ? 52 : title.length > 35 ? 62 : 80
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px 76px', backgroundColor: iconColors.background, color: iconColors.foreground, ...(fontFamily ? { fontFamily } : {}) } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
      h('img', { src: `data:image/svg+xml,${encodeURIComponent(siteIconSvg(site))}`, width: 80, height: 80, alt: '' }),
      h('div', { style: { fontSize: 26, color: '#9aa0a8' } }, label)),
    h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: 22 } },
      h('div', { style: { fontSize, fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.035em', overflowWrap: 'break-word' } }, title),
      subtitle ? h('div', { style: { fontSize: 26, lineHeight: 1.4, color: '#9aa0a8', maxWidth: 1000 } }, subtitle.length > 180 ? `${subtitle.slice(0, 177).trimEnd()}…` : subtitle) : null),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#9aa0a8' } },
      h('div', null, domains[site]), h('div', null, 'Oliver Newth')))
}
