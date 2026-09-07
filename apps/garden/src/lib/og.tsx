import { readFileSync } from 'fs'
import path from 'path'
import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { socialCard } from '@n3wth/site-config/social'

export const OG_SIZE = { width: 1200, height: 630 }

// Keep font IO lazy: ordinary note routes also import this module.
let fonts: { regular: Buffer; semibold: Buffer } | undefined
function loadFonts() {
  if (!fonts) {
    const directory = path.join(process.cwd(), 'src/lib/og-fonts')
    fonts = { regular: readFileSync(path.join(directory, 'Geist-Regular.ttf')), semibold: readFileSync(path.join(directory, 'Geist-SemiBold.ttf')) }
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
