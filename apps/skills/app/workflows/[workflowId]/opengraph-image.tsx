import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { socialCard, socialFonts } from '@n3wth/site-config/social'
import { workflowTemplates } from '@/src/data/workflows'

export const runtime = 'edge'
export const alt = 'workflow'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = await params
  const item = workflowTemplates.find(item => item.id === workflowId)
  return new ImageResponse(socialCard(createElement, {
    site: 'skills',
    title: item?.name ?? 'workflow not found',
    subtitle: item?.description,
  }), { ...size, fonts: socialFonts() })
}
