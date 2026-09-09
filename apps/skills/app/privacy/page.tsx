import type { Metadata } from 'next'
import PrivacyClient from './PrivacyClient'

export const metadata: Metadata = {
  twitter: { images: ['/twitter-image'], card: 'summary_large_image', title: 'Privacy Policy - How We Protect Your Data', description: 'Privacy policy for skills.n3wth.com. Learn how we collect, use, and protect your data. We prioritize transparency and minimal data collection for our AI skills directory.' },
  title: 'Privacy Policy - How We Protect Your Data',
  description: 'Privacy policy for skills.n3wth.com. Learn how we collect, use, and protect your data. We prioritize transparency and minimal data collection for our AI skills directory.',
  alternates: { canonical: '/privacy' },
  openGraph: { type: 'website',
    images: ['/opengraph-image'],
    title: 'Privacy Policy - How We Protect Your Data | skills.n3wth.com',
    description: 'Privacy policy for skills.n3wth.com. Learn how we collect, use, and protect your data. We prioritize transparency and minimal data collection for our AI skills directory.',
    url: 'https://skills.n3wth.com/privacy',
  },
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
