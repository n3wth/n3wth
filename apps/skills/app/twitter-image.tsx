import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'n3wth/skills'
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
          backgroundColor: '#08090b',
          gap: 48,
        }}
      >
        {/* n3wth mark - cursor */}
        <svg width="80" height="80" viewBox="0 0 32 32">
          <path
            d="M9.4 6.6 25.2 14a1.5 1.5 0 0 1-.15 2.78l-6.1 1.78a2 2 0 0 0-1.32 1.24l-2.2 6.1c-.5 1.36-2.42 1.27-2.78-.15L8.0 8.2A1.6 1.6 0 0 1 9.4 6.6Z"
            fill="#ffffff"
          />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          n3wth/skills
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
