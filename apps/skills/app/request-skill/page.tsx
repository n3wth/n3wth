import type { Metadata } from 'next'
import { RequestSkillClient } from './RequestSkillClient'

export const metadata: Metadata = {
  title: 'Request a Skill',
  description: "Request a new skill for the skills.n3wth.com directory. Let us know what you'd like to see.",
  alternates: { canonical: '/request-skill' },
  openGraph: {
    title: 'Request a New AI Skill | skills.n3wth.com',
    description: "Request a new skill for the AI skills directory. Tell us what capability you need and the community can help build it.",
    url: 'https://skills.n3wth.com/request-skill',
  },
}

export default function RequestSkillPage() {
  return <RequestSkillClient />
}
