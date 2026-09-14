import type { Metadata } from 'next'
import { AnalyticsClient } from './AnalyticsClient'

export const metadata: Metadata = {
  twitter: { card: 'summary_large_image', title: 'Community Analytics', description: 'See which skills are popular across the community. Track skill views and installs to discover trending AI coding skills.' },
  robots: { index: false, follow: true },
  title: 'Community Analytics',
  description: 'See which skills are popular across the community. Track skill views and installs to discover trending AI coding skills.',
  alternates: { canonical: '/analytics' },
  openGraph: { type: 'website',
    title: 'Community Analytics', description: 'See which skills are popular across the community. Track skill views and installs to discover trending AI coding skills.',
    url: 'https://skills.n3wth.com/analytics',
  },
}

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
