import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { skills } from '@/src/data/skills'
import { noindexSkillIds } from '@/src/config/indexability'
import { SkillDetailClient } from './SkillDetailClient'
import { SoftwareApplicationJsonLd, WebPageJsonLd, FaqJsonLd } from '@/src/components/seo/JsonLd'

type Props = {
  params: Promise<{ skillId: string }>
}

function skillSeoTitle(skill: { name: string; seoTitle?: string }) {
  return skill.seoTitle || `${skill.name} — AI Skill`
}

function skillSeoDescription(skill: { description: string; longDescription?: string; seoDescription?: string }) {
  if (skill.seoDescription) return skill.seoDescription
  const rawDesc = skill.longDescription || skill.description
  return rawDesc.length > 155 ? rawDesc.slice(0, 155) + '...' : rawDesc
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skillId } = await params
  const skill = skills.find(s => s.id === skillId)

  if (!skill) notFound()

  const title = skillSeoTitle(skill)
  const description = skillSeoDescription(skill)

  return {
    robots: noindexSkillIds.has(skillId) ? { index: false, follow: true } : { index: true, follow: true },
    title,
    description,
    alternates: { canonical: `https://skills.n3wth.com/skill/${skillId}` },
    keywords: skill.tags,
    openGraph: { type: 'website',
      title: `${title} | n3wth/skills`,
      description,
      url: `https://skills.n3wth.com/skill/${skillId}`,
      images: [
        {
          url: `/skill/${skillId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
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

  const title = skill.seoTitle || skill.name
  const description = skill.seoDescription || skill.longDescription || skill.description
  const faq = (skill.faq ?? []).map(({ question, answer, links }) => ({
    question,
    answer: links?.length
      ? `${answer} ${links.map(link => `${link.label}: https://skills.n3wth.com${link.href}`).join(' ')}`
      : answer,
  }))

  return (
    <>
      <SoftwareApplicationJsonLd
        name={skill.name}
        description={description}
        url={`https://skills.n3wth.com/skill/${skill.id}`}
        version={skill.version}
        dateModified={skill.lastUpdated}
        category={skill.category}
      />
      <WebPageJsonLd
        title={title}
        description={description}
        url={`https://skills.n3wth.com/skill/${skill.id}`}
        dateModified={skill.lastUpdated}
        breadcrumbs={[
          { name: 'Home', url: 'https://skills.n3wth.com' },
          { name: 'Skills', url: 'https://skills.n3wth.com' },
          { name: skill.name, url: `https://skills.n3wth.com/skill/${skill.id}` },
        ]}
      />
      {faq.length > 0 && <FaqJsonLd questions={faq} />}
      <SkillDetailClient skillId={skillId} />
    </>
  )
}
