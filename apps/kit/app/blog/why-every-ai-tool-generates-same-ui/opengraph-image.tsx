import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Why Every AI Tool Generates the Same Looking UI — n3wth/kit'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#08090b',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Blog
          </div>
          <div
            style={{
              fontSize: '16px',
              color: '#4b5563',
            }}
          >
            April 6, 2026
          </div>
        </div>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#f2f3f5',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '1000px',
          }}
        >
          Why Every AI Tool Generates the Same Looking UI
        </div>
        <div
          style={{
            fontSize: '22px',
            color: '#9aa0a8',
            lineHeight: 1.5,
            maxWidth: '800px',
          }}
        >
          Training data bias causes AI tools to default to shadcn's visual style
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '48px',
            color: '#6b7280',
            fontSize: '16px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.4 6.6 25.2 14a1.5 1.5 0 0 1-.15 2.78l-6.1 1.78a2 2 0 0 0-1.32 1.24l-2.2 6.1c-.5 1.36-2.42 1.27-2.78-.15L8.0 8.2A1.6 1.6 0 0 1 9.4 6.6Z"
              fill="#6b7280"
            />
          </svg>
          <span>n3wth/kit</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
