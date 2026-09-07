import type { Metadata } from 'next'
import { WorkflowsClient } from './WorkflowsClient'
import { ItemListJsonLd, WebPageJsonLd } from '@/src/components/seo/JsonLd'
import { workflowTemplates } from '@/src/data/workflows'

export const metadata: Metadata = {
  title: 'Skill Workflows — Chain AI Capabilities Together',
  description:
    'Create and share skill workflows that chain multiple AI capabilities together. Combine research, writing, and document creation into powerful automated sequences.',
  alternates: { canonical: 'https://skills.n3wth.com/workflows' },
  openGraph: {
    title: 'Skill Workflows — Chain AI Capabilities Together | n3wth/skills',
    description:
      'Create and share skill workflows that chain multiple AI capabilities together. Combine research, writing, and document creation into powerful automated sequences.',
    url: 'https://skills.n3wth.com/workflows',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill Workflows — Chain AI Capabilities Together',
    description: 'Chain multiple AI capabilities together into powerful automated sequences.',
  },
}

export default function WorkflowsPage() {
  return (
    <>
      <WebPageJsonLd
        title="Skill Workflows"
        description="Create and share skill workflows that chain multiple AI capabilities together."
        url="https://skills.n3wth.com/workflows"
        breadcrumbs={[
          { name: 'Home', url: 'https://skills.n3wth.com' },
          { name: 'Workflows', url: 'https://skills.n3wth.com/workflows' },
        ]}
      />
      <ItemListJsonLd
        name="Skill Workflows"
        description="Chain AI capabilities together into powerful sequences"
        url="https://skills.n3wth.com/workflows"
        items={workflowTemplates.map(workflow => ({
          name: workflow.name,
          url: `https://skills.n3wth.com/workflows/${workflow.id}`,
          description: workflow.description,
        }))}
      />
      <WorkflowsClient />
    </>
  )
}
