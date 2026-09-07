import type { Metadata } from 'next'
import { CreateSkillClient } from './CreateSkillClient'

export const metadata: Metadata = {
  title: 'Create Your Own AI Skill - Interactive Wizard',
  description: 'Create your own AI coding skill with our interactive wizard. Choose from templates or start from scratch.',
  alternates: { canonical: '/create' },
  openGraph: {
    title: 'Create Your Own AI Skill | skills.n3wth.com',
    description: 'Create your own AI coding skill with our interactive wizard. Choose from templates or start from scratch.',
    url: 'https://skills.n3wth.com/create',
  },
}

export default function CreatePage() {
  return <CreateSkillClient />
}
