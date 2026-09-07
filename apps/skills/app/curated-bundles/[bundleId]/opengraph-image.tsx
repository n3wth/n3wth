import { ImageResponse } from 'next/og'
import { bundles } from '@/src/data/bundles'

export const runtime = 'edge'

export const alt = 'Skill Bundle'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const personaColors: Record<string, string> = {
  frontend: '#30d158',
  backend: '#64d2ff',
  devops: '#ff6961',
  creator: '#a855f7',
  analyst: '#ffd60a',
  founder: '#ff9f0a',
}

type Props = {
  params: Promise<{ bundleId: string }>
}

export default async function Image({ params }: Props) {
  const { bundleId } = await params
  const bundle = bundles.find(b => b.id === bundleId)

  if (!bundle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontSize: 48,
          }}
        >
          Bundle Not Found
        </div>
      ),
      { ...size }
    )
  }

  const personaColor = personaColors[bundle.persona] || '#86868b'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000000',
          padding: 60,
        }}
      >
        {/* Top: Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: personaColor,
              textTransform: 'capitalize',
              fontWeight: 500,
            }}
          >
            {bundle.persona} bundle
          </div>
          <div style={{ fontSize: 20, color: '#48484a' }}>•</div>
          <div style={{ fontSize: 20, color: '#48484a' }}>
            {bundle.skillIds.length} skills
          </div>
        </div>

        {/* Middle: Name, Description */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {bundle.name}
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#86868b',
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {bundle.description}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: '#48484a',
            }}
          >
            Setup: {bundle.estimatedSetupTime}
          </div>
          <div style={{ fontSize: 18, color: '#48484a' }}>
            skills.n3wth.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

