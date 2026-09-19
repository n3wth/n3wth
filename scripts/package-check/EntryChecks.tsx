import { useState } from 'react'
import { Button, CodeBlock, ErrorBoundary, useMediaQuery } from '@n3wth/ui'
import { N3wthProvider, SiteContainer } from '@n3wth/ui/site'
import { ConvergeLight, VisualBand } from '@n3wth/ui/visuals'

export function EntryChecks() {
  const [count, setCount] = useState(0)
  const desktop = useMediaQuery('(min-width: 768px)')
  return <N3wthProvider mode="dark">
    <ErrorBoundary>
      <SiteContainer as="section" aria-label="Package entries">
        <h2>Package entry checks</h2>
        <Button onClick={() => setCount(count + 1)}>Root button</Button>
        <output data-testid="root-count">Root clicks: {count}</output>
        <output data-testid="root-media">{desktop ? 'desktop' : 'mobile'}</output>
        <CodeBlock code="const packed = true" />
        <VisualBand fullBleed={false} data-testid="package-visual"><ConvergeLight /></VisualBand>
      </SiteContainer>
    </ErrorBoundary>
  </N3wthProvider>
}
