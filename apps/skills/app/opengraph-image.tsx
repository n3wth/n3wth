import { ImageResponse } from 'next/og'
import { skills } from '@/src/data/skills'

export const runtime = 'edge'

export const alt = 'n3wth/skills'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const skillCount = skills.length
  const categoryCount = new Set(skills.map(s => s.category)).size

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
              fontSize: 64,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textAlign: 'center',
            }}
          >
            n3wth/skills
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: '#86868b',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Markdown skills for Gemini CLI, Cursor, Windsurf, and Copilot
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
                  color: '#30d158',
                }}
              >
                {skillCount}
              </div>
              <div style={{ fontSize: 20, color: '#86868b' }}>skills</div>
            </div>
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
                {categoryCount}
              </div>
              <div style={{ fontSize: 20, color: '#86868b' }}>categories</div>
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
