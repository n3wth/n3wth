import { ImageResponse } from 'next/og'
import { workflowTemplates } from '@/src/data/workflows'

export const runtime = 'edge'

export const alt = 'Skill Workflows'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const workflowCount = workflowTemplates.length

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
          {/* Flow diagram representation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#1d1d1f',
                border: '2px solid #30d158',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              ◆
            </div>
            <div style={{ fontSize: 24, color: '#48484a' }}>→</div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#1d1d1f',
                border: '2px solid #64d2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              ◇
            </div>
            <div style={{ fontSize: 24, color: '#48484a' }}>→</div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#1d1d1f',
                border: '2px solid #a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              ◈
            </div>
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
            Skill Workflows
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
            Chain AI capabilities together into powerful sequences
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
                  color: '#64d2ff',
                }}
              >
                {workflowCount}
              </div>
              <div style={{ fontSize: 20, color: '#86868b' }}>templates</div>
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
