import type { Metadata } from 'next'
import ContributeClient from './ContributeClient'

export const metadata: Metadata = {
  title: 'Contribute a Skill to the Community Directory',
  description: 'Share your AI coding skills with the community. Submit markdown templates and best practices for Gemini CLI, Cursor, and other AI assistants to help developers worldwide.',
  alternates: { canonical: '/contribute' },
  openGraph: {
    title: 'Contribute a Skill to the Community Directory | skills.n3wth.com',
    description: 'Share your AI coding skills with the community. Submit markdown templates and best practices for Gemini CLI, Cursor, and other AI assistants to help developers worldwide.',
    url: 'https://skills.n3wth.com/contribute',
  },
}

export default function ContributePage() {
  return <ContributeClient />
}
