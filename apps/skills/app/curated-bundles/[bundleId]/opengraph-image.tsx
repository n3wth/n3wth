import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { socialCard, socialFonts } from '@n3wth/site-config/social'
import { bundles } from '@/src/data/bundles'

export const runtime = 'edge'
export const alt = 'bundle'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params
  const item = bundles.find(item => item.id === bundleId)
  return new ImageResponse(socialCard(createElement, {
    site: 'skills',
    title: item?.name ?? 'bundle not found',
    subtitle: item?.description,
  }), { ...size, fonts: socialFonts() })
}
