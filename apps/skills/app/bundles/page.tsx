import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BundlesClient } from './BundlesClient'

export const metadata: Metadata = {
  title: 'Skill Bundles - Create and Share Skill Collections',
  description: 'Create and share collections of AI coding skills. Bundle your favorite skills together for easy one-command installation and share them with your team or the community.',
  alternates: { canonical: '/bundles' },
  openGraph: {
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
