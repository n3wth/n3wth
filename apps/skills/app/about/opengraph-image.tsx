import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'About n3wth/skills'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
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
          {/* n3wth mark */}
          <svg width="64" height="64" viewBox="0 0 32 32">
            <path
              d="M9.4 6.6 25.2 14a1.5 1.5 0 0 1-.15 2.78l-6.1 1.78a2 2 0 0 0-1.32 1.24l-2.2 6.1c-.5 1.36-2.42 1.27-2.78-.15L8.0 8.2A1.6 1.6 0 0 1 9.4 6.6Z"
              fill="#ffffff"
            />
          </svg>

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
            About n3wth/skills
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 26,
              color: '#86868b',
              textAlign: 'center',
              maxWidth: 800,
              lineHeight: 1.5,
            }}
          >
            Building the ecosystem for AI coding assistant extensions
          </div>

          {/* Values */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 32, color: '#30d158' }}>◆</div>
              <div style={{ fontSize: 16, color: '#86868b' }}>Open Source</div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 32, color: '#64d2ff' }}>◇</div>
              <div style={{ fontSize: 16, color: '#86868b' }}>Community</div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 32, color: '#a855f7' }}>◈</div>
              <div style={{ fontSize: 16, color: '#86868b' }}>Quality</div>
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
