import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { ItemListJsonLd } from '@/src/components/seo/JsonLd'
import { skills } from '@/src/data/skills'

export const metadata: Metadata = {
  title: 'n3wth/skills',
  description:
    'Markdown skills for Gemini CLI, Cursor, Windsurf, and Copilot. 46 skills. One install, works offline.',
  alternates: { canonical: 'https://skills.n3wth.com' },
  openGraph: {
    title: 'n3wth/skills',
    description:
      'Markdown skills for Gemini CLI, Cursor, Windsurf, and Copilot. 46 skills. One install, works offline.',
    url: 'https://skills.n3wth.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'n3wth/skills',
    description:
      'Markdown skills for coding agents. One install, works offline.',
  },
}

export default function Home() {
  const featuredSkills = skills.filter(s => s.featured).slice(0, 12)

  return (
    <>
      <ItemListJsonLd
        name="AI Coding Skills Catalog"
        description="Markdown skills for Gemini CLI, Cursor, Windsurf, and Copilot"
        url="https://skills.n3wth.com"
        items={featuredSkills.map(skill => ({
          name: skill.name,
          url: `https://skills.n3wth.com/skill/${skill.id}`,
          description: skill.description,
        }))}
      />
      <HomeClient />
    </>
  )
}
