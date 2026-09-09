/**
 * Platform compatibility badges for Antigravity CLI
 * Uses official brand colors and icons
 */
import type { ReactNode } from 'react'

type Platform = 'gemini'

interface PlatformConfig {
  name: string
  color: string
  bgColor: string
  borderColor: string
  icon: ReactNode
}

const platformConfigs: Record<Platform, PlatformConfig> = {
  gemini: {
    name: 'Antigravity CLI',
    color: '#4285F4', // Google Blue
    bgColor: 'rgba(66, 133, 244, 0.15)',
    borderColor: 'rgba(66, 133, 244, 0.3)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 65 65" fill="none">
        <path
          d="M32.5 0c.68 0 1.27.47 1.44 1.13a39 39 0 002 5.9c2.15 5 5.1 9.38 8.85 13.13 3.75 3.75 8.13 6.7 13.13 8.85a39 39 0 005.9 2c.66.17 1.13.76 1.13 1.44s-.47 1.27-1.13 1.44a39 39 0 00-5.9 2c-5 2.15-9.38 5.1-13.13 8.85-3.75 3.75-6.7 8.13-8.85 13.13a39 39 0 00-2 5.9c-.17.66-.76 1.13-1.44 1.13s-1.27-.47-1.44-1.13a39 39 0 00-2-5.9c-2.15-5-5.1-9.38-8.85-13.13-3.75-3.75-8.13-6.7-13.13-8.85a39 39 0 00-5.9-2A1.49 1.49 0 010 32.5c0-.68.47-1.27 1.13-1.44a39 39 0 005.9-2c5-2.15 9.38-5.1 13.13-8.85 3.75-3.75 6.7-8.13 8.85-13.13a39 39 0 002-5.9A1.49 1.49 0 0132.5 0z"
          fill="currentColor"
        />
      </svg>
    ),
  },
}

interface PlatformBadgeProps {
  platform: Platform
  size?: 'sm' | 'md'
}

export function PlatformBadge({ platform, size = 'md' }: PlatformBadgeProps) {
  const config = platformConfigs[platform]
  if (!config) return null

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-1 gap-1'
    : 'text-xs px-3 py-1.5 gap-1.5'

  return (
    <span
      className={`font-medium rounded-full flex items-center ${sizeClasses}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      {config.icon}
      {config.name}
    </span>
  )
}

interface PlatformBadgesProps {
  platforms?: Platform[]
  size?: 'sm' | 'md'
  className?: string
}

export function PlatformBadges({ platforms, size = 'md', className = '' }: PlatformBadgesProps) {
  if (!platforms || platforms.length === 0) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {platforms.map(platform => (
        <PlatformBadge key={platform} platform={platform} size={size} />
      ))}
    </div>
  )
}

export type { Platform }
