import type { Metadata } from 'next'
import { RequestsClient } from './RequestsClient'

export const metadata: Metadata = {
  twitter: { card: 'summary_large_image', images: ['/twitter-image'], title: 'Feature Requests', description: 'Submit and vote on new skill ideas. Help shape the future of AI coding skills.' },
  openGraph: { type: 'website', images: ['/opengraph-image'], title: 'Feature Requests', description: 'Submit and vote on new skill ideas. Help shape the future of AI coding skills.', url: 'https://skills.n3wth.com/requests' },
  robots: { index: true, follow: true },
  title: 'Feature Requests',
  description: 'Submit and vote on new skill ideas. Help shape the future of AI coding skills.',
  alternates: { canonical: '/requests' },
}

export default function RequestsPage() {
  return <RequestsClient />
}
