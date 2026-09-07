import { ImageResponse } from 'next/og'
import { workflowTemplates } from '@/src/data/workflows'

export const runtime = 'edge'

export const alt = 'Workflow'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

type Props = {
  params: Promise<{ workflowId: string }>
}

export default async function Image({ params }: Props) {
  const { workflowId } = await params
  const workflow = workflowTemplates.find(w => w.id === workflowId)

  if (!workflow) {
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
          Workflow Not Found
        </div>
      ),
      { ...size }
    )
  }

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
              color: '#64d2ff',
              fontWeight: 500,
            }}
          >
            Workflow
          </div>
          <div style={{ fontSize: 20, color: '#48484a' }}>•</div>
          <div style={{ fontSize: 20, color: '#48484a' }}>
            {workflow.nodes.length} skills
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
            {workflow.name}
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#86868b',
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {workflow.description}
          </div>

          {/* Nodes preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            {workflow.nodes.slice(0, 4).map((node, i) => (
              <div
                key={node.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: '#1d1d1f',
                    fontSize: 16,
                    color: '#ffffff',
                  }}
                >
                  {node.skillId}
                </div>
                {i < Math.min(workflow.nodes.length - 1, 3) && (
                  <div style={{ fontSize: 18, color: '#48484a' }}>→</div>
                )}
              </div>
            ))}
            {workflow.nodes.length > 4 && (
              <div style={{ fontSize: 18, color: '#48484a' }}>+{workflow.nodes.length - 4}</div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}
        >
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

