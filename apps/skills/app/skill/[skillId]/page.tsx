import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { skills } from '@/src/data/skills'
import { noindexSkillIds } from '@/src/config/indexability'
import { SkillDetailClient } from './SkillDetailClient'
import { SoftwareApplicationJsonLd, WebPageJsonLd } from '@/src/components/seo/JsonLd'

type Props = {
  params: Promise<{ skillId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skillId } = await params
  const skill = skills.find(s => s.id === skillId)

  if (!skill) notFound()

  const rawDesc = skill.longDescription || skill.description
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 155) + '...' : rawDesc

  return {
    robots: noindexSkillIds.has(skillId) ? { index: false, follow: true } : { index: true, follow: true },
    title: `${skill.name} — AI Skill`,
    description,
    alternates: { canonical: `https://skills.n3wth.com/skill/${skillId}` },
    keywords: skill.tags,
    openGraph: { type: 'website',
      title: `${skill.name} — AI Skill | n3wth/skills`,
      description,
      url: `https://skills.n3wth.com/skill/${skillId}`,
      images: [
        {
          url: `/skill/${skillId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${skill.name} — AI Skill`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${skill.name} — AI Skill`,
      description,
      images: [`/skill/${skillId}/opengraph-image`],
    },
  }
}

export async function generateStaticParams() {
  return skills.map((skill) => ({ skillId: skill.id }))
}

export default async function SkillDetailPage({ params }: Props) {
  const { skillId } = await params
  const skill = skills.find(s => s.id === skillId)

  if (!skill) notFound()

  return (
    <>
      <SoftwareApplicationJsonLd
        name={skill.name}
        description={skill.longDescription || skill.description}
        url={`https://skills.n3wth.com/skill/${skill.id}`}
        version={skill.version}
        dateModified={skill.lastUpdated}
        category={skill.category}
      />
      <WebPageJsonLd
        title={skill.name}
        description={skill.longDescription || skill.description}
        url={`https://skills.n3wth.com/skill/${skill.id}`}
        dateModified={skill.lastUpdated}
        breadcrumbs={[
          { name: 'Home', url: 'https://skills.n3wth.com' },
          { name: 'Skills', url: 'https://skills.n3wth.com' },
          { name: skill.name, url: `https://skills.n3wth.com/skill/${skill.id}` },
        ]}
      />
      <SkillDetailClient skillId={skillId} />
    </>
  )
}
