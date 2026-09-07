import type { Metadata } from 'next'
import { CuratedBundlesClient } from './CuratedBundlesClient'
import { ItemListJsonLd, WebPageJsonLd } from '@/src/components/seo/JsonLd'
import { bundles } from '@/src/data/bundles'

export const metadata: Metadata = {
  title: 'Curated Skill Bundles for Every Role',
  description:
    'Pre-built skill bundles for different roles. From frontend developers to founders, get pre-curated collections designed for your profession.',
  alternates: { canonical: 'https://skills.n3wth.com/curated-bundles' },
  openGraph: {
    title: 'Curated Skill Bundles for Every Role | n3wth/skills',
    description:
      'Pre-built skill bundles for different roles. From frontend developers to founders, get pre-curated collections designed for your profession.',
    url: 'https://skills.n3wth.com/curated-bundles',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curated Skill Bundles for Every Role',
    description: 'Pre-built skill bundles for different roles and professions.',
  },
}

export default function CuratedBundlesPage() {
  return (
    <>
      <WebPageJsonLd
        title="Curated Skill Bundles for Every Role"
        description="Pre-built skill bundles for different roles. From frontend developers to founders, get pre-curated collections designed for your profession."
        url="https://skills.n3wth.com/curated-bundles"
        breadcrumbs={[
          { name: 'Home', url: 'https://skills.n3wth.com' },
          { name: 'Bundles', url: 'https://skills.n3wth.com/curated-bundles' },
        ]}
      />
      <ItemListJsonLd
        name="Curated Skill Bundles"
        description="Pre-built skill collections for every role"
        url="https://skills.n3wth.com/curated-bundles"
        items={bundles.map(bundle => ({
          name: bundle.name,
          url: `https://skills.n3wth.com/curated-bundles/${bundle.id}`,
          description: bundle.description,
        }))}
      />
      <CuratedBundlesClient />
    </>
  )
}
