import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BundlesClient } from './BundlesClient'

export const metadata: Metadata = {
  twitter: { images: ['/twitter-image'], card: 'summary_large_image', title: 'Skill Bundles - Create and Share Skill Collections', description: 'Create and share collections of AI coding skills. Bundle your favorite skills together for easy one-command installation and share them with your team or the community.' },
  title: 'Skill Bundles - Create and Share Skill Collections',
  description: 'Create and share collections of AI coding skills. Bundle your favorite skills together for easy one-command installation and share them with your team or the community.',
  alternates: { canonical: '/bundles' },
  openGraph: { type: 'website',
    images: ['/opengraph-image'],
    title: 'Skill Bundles - Create and Share Skill Collections | skills.n3wth.com',
    description: 'Create and share collections of AI coding skills. Bundle your favorite skills together for easy one-command installation and share them with your team or the community.',
    url: 'https://skills.n3wth.com/bundles',
  },
}

export default function BundlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BundlesClient />
    </Suspense>
  )
}
