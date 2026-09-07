import type { Metadata } from 'next'
import { bundles } from '@/src/data/bundles'
import { skills } from '@/src/data/skills'
import { BundleDetailClient } from './BundleDetailClient'
import { ItemListJsonLd, WebPageJsonLd } from '@/src/components/seo/JsonLd'

type Props = {
  params: Promise<{ bundleId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bundleId } = await params
  const bundle = bundles.find(b => b.id === bundleId)

  if (!bundle) {
    return {
      title: 'Bundle Not Found',
      description: 'The bundle you are looking for does not exist.',
    }
  }

  return {
    title: `${bundle.name} — Skill Bundle`,
    description: bundle.description,
    alternates: { canonical: `https://skills.n3wth.com/curated-bundles/${bundleId}` },
    openGraph: {
      title: `${bundle.name} — Skill Bundle | n3wth/skills`,
      description: bundle.description,
      url: `https://skills.n3wth.com/curated-bundles/${bundleId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bundle.name} — Skill Bundle`,
      description: bundle.description,
    },
    keywords: bundle.tags,
  }
}

export async function generateStaticParams() {
  return bundles.map((bundle) => ({ bundleId: bundle.id }))
}

export default async function BundleDetailPage({ params }: Props) {
  const { bundleId } = await params
  const bundle = bundles.find(b => b.id === bundleId)

  if (!bundle) {
    return <BundleDetailClient bundleId={bundleId} />
  }

  const bundleSkills = bundle.skillIds
    .map(id => skills.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)

  return (
    <>
      <WebPageJsonLd
        title={bundle.name}
        description={bundle.description}
        url={`https://skills.n3wth.com/curated-bundles/${bundle.id}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://skills.n3wth.com' },
          { name: 'Bundles', url: 'https://skills.n3wth.com/curated-bundles' },
          { name: bundle.name, url: `https://skills.n3wth.com/curated-bundles/${bundle.id}` },
        ]}
      />
      <ItemListJsonLd
        name={`${bundle.name} Skills`}
        description={`Skills included in the ${bundle.name} bundle`}
        url={`https://skills.n3wth.com/curated-bundles/${bundle.id}`}
        items={bundleSkills.map(skill => ({
          name: skill.name,
          url: `https://skills.n3wth.com/skill/${skill.id}`,
          description: skill.description,
        }))}
      />
      <BundleDetailClient bundleId={bundleId} />
    </>
  )
}
