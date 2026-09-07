export type SiteIconId = 'portfolio' | 'garden' | 'kit' | 'r3' | 'skills' | 'ui'
export const iconColors: { background: string; foreground: string }
export const siteIcons: Record<SiteIconId, { name: string; symbol: string; paths: string }>
export function siteIconSvg(site: SiteIconId, options?: { background?: boolean }): string
