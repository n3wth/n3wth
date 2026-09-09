export const iconColors = { background: '#08090b', foreground: '#ffffff' }

export const siteIcons = {
  portfolio: { name: 'n3wth', symbol: 'Home', paths: '<path d="M16 30L32 16L48 30M21 26V47H43V26M28 47V35H36V47"/>' },
  garden: { name: 'Garden', symbol: 'Sprout', paths: '<path d="M32 46V32M32 35C22 35 18 29 18 21C28 21 32 27 32 35ZM32 31C32 23 38 18 46 18C46 27 41 32 32 32"/>' },
  kit: { name: 'Kit', symbol: 'Cube', paths: '<path d="M32 16L47 24V41L32 49L17 41V24ZM17 24L32 33L47 24M32 33V49"/>' },
  r3: { name: 'r3', symbol: 'Rings', paths: '<circle cx="32" cy="32" r="16"/><circle cx="32" cy="32" r="9"/><circle cx="32" cy="32" r="2" fill="currentColor" stroke="none"/>' },
  skills: { name: 'Skills', symbol: 'Cards', paths: '<rect x="18" y="24" width="28" height="22" rx="3"/><path d="M22 18h20M27 31h10M27 38h6"/>' },
  ui: { name: 'UI', symbol: 'Grid', paths: '<rect x="18" y="18" width="11" height="11" rx="2"/><rect x="35" y="18" width="11" height="11" rx="2"/><rect x="18" y="35" width="11" height="11" rx="2"/><rect x="35" y="35" width="11" height="11" rx="2"/>' },
}

export function siteIconSvg(site, { background = true } = {}) {
  const icon = siteIcons[site]
  if (!icon) throw new Error(`Unknown site: ${site}`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><title>${icon.name}</title>${background ? `<rect width="64" height="64" rx="16" fill="${iconColors.background}"/>` : ''}<g color="${iconColors.foreground}" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${icon.paths}</g></svg>`
}
