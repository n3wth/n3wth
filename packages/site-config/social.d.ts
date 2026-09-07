import type { SiteIconId } from './icons.js'
export const socialSize: { width: number; height: number }
export function socialFonts(): { name: string; data: ArrayBuffer; weight: 400 | 600; style: 'normal' }[]
export function socialCard<T>(h: (...args: any[]) => T, options: { site: SiteIconId; title: string; subtitle?: string; fontFamily?: string }): T
