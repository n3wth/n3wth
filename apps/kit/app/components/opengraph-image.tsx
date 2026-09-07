import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { socialCard, socialFonts } from '@n3wth/site-config/social'

export const runtime = 'edge'
export const alt = "Components"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(socialCard(createElement, {"site":"kit","title":"Components","subtitle":"The Kit component registry"}), { ...size, fonts: socialFonts() })
}
