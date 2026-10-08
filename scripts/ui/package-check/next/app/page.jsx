import { CodeBlock, ErrorBoundary, OGCard as RootOGCard } from '@n3wth/ui'
import { OGCard } from '@n3wth/ui/og'
import { N3wthProvider, SiteContainer } from '@n3wth/ui/site'
import { ConvergeLight, VisualBand } from '@n3wth/ui/visuals'
import Client from './client'

export default function Page() {
  const serverCard = OGCard({ title: 'Server OG entry' })
  const rootCard = RootOGCard({ title: 'Server root entry' })
  return <N3wthProvider mode="dark">
    <SiteContainer as="main">
      <h1>Next packed consumer</h1>
      <div hidden>{serverCard}{rootCard}</div>
      <ErrorBoundary>
        <CodeBlock code="const serverImport = true" />
        <VisualBand fullBleed={false} data-testid="server-visual"><ConvergeLight /></VisualBand>
        <Client />
      </ErrorBoundary>
    </SiteContainer>
  </N3wthProvider>
}
