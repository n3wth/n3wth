export interface ThoughtPiece {
  id: string
  title: string
  description: string
  insights: string[]
  category: 'AI' | 'Trust'
}

// agents-org-design, trust-production, and ambient-ai graduated to full
// registered pieces (src/components/thinking/registry.tsx) with live
// specimens instead of plain description+insights — this array only
// holds pieces that haven't gotten that treatment yet.
export const thoughtPieces: ThoughtPiece[] = []
