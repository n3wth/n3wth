import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for skills.n3wth.com. Learn how we handle your data when using our AI skills directory.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy',
    description: 'Privacy policy for skills.n3wth.com. Learn how we handle your data when using our AI skills directory.',
    url: '/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
