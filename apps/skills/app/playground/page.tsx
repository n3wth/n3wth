import type { Metadata } from 'next'
import { PlaygroundClient } from './PlaygroundClient'

export const metadata: Metadata = {
  twitter: { card: 'summary_large_image', title: 'Skill Playground', description: 'Try AI skills before installing. See example prompts and outputs to understand what each skill can do.' },
  openGraph: { type: 'website', title: 'Skill Playground', description: 'Try AI skills before installing. See example prompts and outputs to understand what each skill can do.', url: 'https://skills.n3wth.com/playground' },
  robots: { index: false, follow: true },
  title: 'Skill Playground',
  description: 'Try AI skills before installing. See example prompts and outputs to understand what each skill can do.',
  alternates: { canonical: '/playground' },
  keywords: ['AI playground', 'skill demo', 'try before install'],
}

export default function PlaygroundPage() {
  return <PlaygroundClient />
}
