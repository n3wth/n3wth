import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { socialCard, socialFonts } from '@n3wth/site-config/social'
import { skills } from '@/src/data/skills'

export const runtime = 'edge'
export const alt = 'skill'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = await params
  const item = skills.find(item => item.id === skillId)
  return new ImageResponse(socialCard(createElement, {
    site: 'skills',
    title: item?.name ?? 'skill not found',
    subtitle: item?.description,
  }), { ...size, fonts: socialFonts() })
}
