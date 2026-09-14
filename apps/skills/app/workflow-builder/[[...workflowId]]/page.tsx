import type { Metadata } from 'next'
import { pageMetadata } from '@n3wth/site-config/metadata'
import { WorkflowBuilderClient } from './WorkflowBuilderClient'
import { workflowTemplates } from '@/src/data/workflows'

export function generateStaticParams() {
  const templateParams = workflowTemplates.map((workflow) => ({
    workflowId: [workflow.id],
  }))

  return [
    { workflowId: [] },
    { workflowId: ['new'] },
    ...templateParams,
  ]
}

export async function generateMetadata({ params }: WorkflowBuilderPageProps): Promise<Metadata> {
  const { workflowId } = await params
  const template = workflowTemplates.find(workflow => workflow.id === workflowId?.[0])
  return {
    ...pageMetadata({
      title: template ? `Edit ${template.name}` : 'Workflow Builder',
      description: template?.description ?? 'Build and edit your locally saved AI skill workflows.',
      url: `https://skills.n3wth.com/workflow-builder${workflowId?.length ? `/${workflowId.map(encodeURIComponent).join('/')}` : ''}`,
    }),
    robots: { index: false, follow: true },
  }
}

interface WorkflowBuilderPageProps {
  params: Promise<{ workflowId?: string[] }>
}

export default async function WorkflowBuilderPage({ params }: WorkflowBuilderPageProps) {
  const { workflowId } = await params
  const workflowIdParam = workflowId?.[0]

  return <WorkflowBuilderClient workflowId={workflowIdParam} />
}
