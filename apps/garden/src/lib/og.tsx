import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { socialCard } from '@n3wth/site-config/social'
import manifest from './content-manifest.json' with { type: 'json' }

export const OG_SIZE = { width: 1200, height: 630 }

/* Fonts ship inside the bundled manifest (base64) — the workerd preview
   has no filesystem, and outputFileTracingIncludes could not help there.
   Decode lazily: ordinary note routes also import this module. */
let fonts: { regular: Buffer; semibold: Buffer } | undefined
function loadFonts() {
  if (!fonts) {
    fonts = {
      regular: Buffer.from(manifest.fonts.regular, 'base64'),
      semibold: Buffer.from(manifest.fonts.semibold, 'base64'),
    }
  }
  return fonts
}

export function ogCard({ title = 'Garden', subtitle }: { title?: string; subtitle?: string } = {}) {
  const fonts = loadFonts()
  return new ImageResponse(socialCard(createElement, { site: 'garden', title, subtitle, fontFamily: 'Geist' }), {
    ...OG_SIZE,
    fonts: [
      { name: 'Geist', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Geist', data: fonts.semibold, weight: 600, style: 'normal' },
    ],
  })
}
