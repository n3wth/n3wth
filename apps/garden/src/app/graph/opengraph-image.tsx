import { ogCard, OG_SIZE } from '@/lib/og'
import { getGraphData } from '@/lib/graph'

export const runtime = 'nodejs'
export const alt = 'Garden graph — explore the connections'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  const graphData = getGraphData()
  return ogCard({
    title: 'Garden graph',
    subtitle: `${graphData.nodes.length} notes connected by ${graphData.edges.length} links`,
  })
}
