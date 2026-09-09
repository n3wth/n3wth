import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  twitter: { images: ['/twitter-image'], card: 'summary_large_image', title: 'Contact Us - Report Issues or Contribute Skills', description: 'Get in touch about AI coding skills, report bugs, request new features, or learn how to contribute your own skills to the community directory.' },
  title: 'Contact Us - Report Issues or Contribute Skills',
  description: 'Get in touch about AI coding skills, report bugs, request new features, or learn how to contribute your own skills to the community directory.',
  alternates: { canonical: '/contact' },
  openGraph: { type: 'website',
    images: ['/opengraph-image'],
    title: 'Contact Us - Report Issues or Contribute Skills | skills.n3wth.com',
    description: 'Get in touch about AI coding skills, report bugs, request new features, or learn how to contribute your own skills to the community directory.',
    url: 'https://skills.n3wth.com/contact',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
