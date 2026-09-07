import { ImageResponse } from 'next/og'
import { skills } from '@/src/data/skills'

export const runtime = 'edge'

export const alt = 'Skill'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const categoryColors: Record<string, string> = {
  development: '#30d158',
  documents: '#ff6961',
  creative: '#64d2ff',
  productivity: '#a855f7',
  business: '#ffd60a',
}

type Props = {
  params: Promise<{ skillId: string }>
}

export default async function Image({ params }: Props) {
  const { skillId } = await params
  const skill = skills.find(s => s.id === skillId)

  if (!skill) {
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
          Skill Not Found
        </div>
      ),
      { ...size }
    )
  }

  const categoryColor = categoryColors[skill.category] || '#86868b'

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
        {/* Top: Category badge */}
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
              color: categoryColor,
              textTransform: 'capitalize',
              fontWeight: 500,
            }}
          >
            {skill.category}
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#48484a',
            }}
          >
            •
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#48484a',
            }}
          >
            v{skill.version}
          </div>
        </div>

        {/* Middle: Icon, Name, Description */}
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
              marginBottom: 8,
            }}
          >
            {skill.icon}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {skill.name}
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#86868b',
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {skill.description}
          </div>
        </div>

        {/* Bottom: Install command and domain */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              backgroundColor: '#1d1d1f',
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 16, color: '#86868b' }}>$</div>
            <div style={{ fontSize: 16, color: '#ffffff', fontFamily: 'monospace' }}>
              npx skills add {skill.id}
            </div>
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

