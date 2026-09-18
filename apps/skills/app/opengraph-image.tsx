import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { socialCard, socialFonts } from '@n3wth/site-config/social'

export const alt = "Agent Skills"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(socialCard(createElement, {"site":"skills","title":"Agent Skills","subtitle":"Markdown skills for Antigravity CLI"}), { ...size, fonts: socialFonts() })
}
