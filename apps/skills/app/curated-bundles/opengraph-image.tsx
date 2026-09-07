import { ImageResponse } from 'next/og'
import { bundles } from '@/src/data/bundles'

export const runtime = 'edge'

export const alt = 'Curated Skill Bundles'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const bundleCount = bundles.length

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
          }}
        >
          {/* Icon row */}
          <div style={{ display: 'flex', gap: 24, fontSize: 48 }}>
            <span>📦</span>
            <span>⚡</span>
            <span>🎯</span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Curated Skill Bundles
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 26,
              color: '#86868b',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Pre-built skill collections for every role
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 48,
              marginTop: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 600,
                  color: '#a855f7',
                }}
              >
                {bundleCount}
              </div>
              <div style={{ fontSize: 20, color: '#86868b' }}>bundles</div>
            </div>
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#48484a',
          }}
        >
          skills.n3wth.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
