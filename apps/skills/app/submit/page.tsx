import type { Metadata } from 'next'
import { SubmitClient } from './SubmitClient'

export const metadata: Metadata = {
  title: 'Submit a Skill',
  description: 'Submit your skill to the skills.n3wth.com directory. Contribute to the community and help others extend their AI assistants.',
  alternates: { canonical: '/submit' },
  openGraph: {
    title: 'Submit Your AI Skill to the Community Directory | skills.n3wth.com',
    description: 'Submit your skill to the AI skills directory. Contribute to the community and help developers worldwide extend their AI coding assistants.',
    url: 'https://skills.n3wth.com/submit',
  },
}

export default function SubmitPage() {
  return <SubmitClient />
}
