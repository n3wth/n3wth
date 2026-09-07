import type { Metadata } from 'next'
import { workflowTemplates } from '@/src/data/workflows'
import { WorkflowBuilderClient } from './WorkflowBuilderClient'
import { WebPageJsonLd, ItemListJsonLd } from '@/src/components/seo/JsonLd'
import { skills } from '@/src/data/skills'

type Props = {
  params: Promise<{ workflowId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workflowId } = await params

  if (workflowId === 'new') {
    return {
      title: 'Create AI Workflow — Visual Skill Builder',
      description:
        'Build custom AI workflows by chaining skills together. Create automated sequences combining research, writing, and document creation.',
      alternates: { canonical: 'https://skills.n3wth.com/workflows/new' },
      openGraph: {
        title: 'Create AI Workflow | n3wth/skills',
        description:
          'Build custom AI workflows by chaining skills together. Create automated sequences combining research, writing, and document creation.',
        url: 'https://skills.n3wth.com/workflows/new',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Create AI Workflow — Visual Skill Builder',
        description: 'Build custom AI workflows by chaining skills together.',
      },
    }
  }

  const template = workflowTemplates.find(w => w.id === workflowId)

  if (template) {
    const desc =
      template.description.length >= 120
        ? template.description
        : `${template.description} Chain multiple AI skills together in an automated workflow to boost your productivity.`
    const titleSuffix = ' — AI Workflow'
    const maxNameLength = 60 - titleSuffix.length
    const truncatedName =
      template.name.length > maxNameLength ? template.name.slice(0, maxNameLength - 3) + '...' : template.name
    return {
      title: `${truncatedName}${titleSuffix}`,
      description: desc,
      alternates: { canonical: `https://skills.n3wth.com/workflows/${workflowId}` },
      keywords: template.tags,
      openGraph: {
        title: `${template.name} — AI Workflow | n3wth/skills`,
        description: desc,
        url: `https://skills.n3wth.com/workflows/${workflowId}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${truncatedName}${titleSuffix}`,
        description: desc,
      },
    }
  }

  return {
    title: 'Edit AI Skill Workflow — Visual Builder',
    description:
      'Edit and customize your AI workflow by chaining skills together. Connect research, writing, and document creation skills into powerful automated sequences.',
    alternates: { canonical: `https://skills.n3wth.com/workflows/${workflowId}` },
    openGraph: {
      title: 'Edit AI Skill Workflow — Visual Builder | n3wth/skills',
      description:
        'Edit and customize your AI workflow by chaining skills together. Connect research, writing, and document creation skills into powerful automated sequences.',
      url: `https://skills.n3wth.com/workflows/${workflowId}`,
    },
  }
}

export async function generateStaticParams() {
  return [{ workflowId: 'new' }, ...workflowTemplates.map(workflow => ({ workflowId: workflow.id }))]
}

export default async function WorkflowBuilderPage({ params }: Props) {
  const { workflowId } = await params
  const template = workflowTemplates.find(w => w.id === workflowId)

  if (!template || workflowId === 'new') {
    return <WorkflowBuilderClient workflowId={workflowId} />
  }

  const workflowSkills = template.nodes
    .map(node => skills.find(s => s.id === node.skillId))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)

  return (
    <>
      <WebPageJsonLd
        title={template.name}
        description={template.description}
        url={`https://skills.n3wth.com/workflows/${template.id}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://skills.n3wth.com' },
          { name: 'Workflows', url: 'https://skills.n3wth.com/workflows' },
          { name: template.name, url: `https://skills.n3wth.com/workflows/${template.id}` },
        ]}
      />
      <ItemListJsonLd
        name={`${template.name} Skills`}
        description={`Skills used in the ${template.name} workflow`}
        url={`https://skills.n3wth.com/workflows/${template.id}`}
        items={workflowSkills.map(skill => ({
          name: skill.name,
          url: `https://skills.n3wth.com/skill/${skill.id}`,
          description: skill.description,
        }))}
      />
      <WorkflowBuilderClient workflowId={workflowId} />
    </>
  )
}
