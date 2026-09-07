import type { Metadata } from 'next'
import AboutClient from './AboutClient'
import { WebPageJsonLd } from '@/src/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'About AI Skills — What They Are and How They Work',
  description:
    'Learn what AI coding skills are, how they work with Gemini CLI, Cursor, and other assistants, and when to use them vs MCP servers for your development workflow.',
  alternates: { canonical: 'https://skills.n3wth.com/about' },
  openGraph: {
    title: 'About AI Skills — What They Are and How They Work | n3wth/skills',
    description:
      'Learn what AI coding skills are, how they work with Gemini CLI, Cursor, and other assistants, and when to use them vs MCP servers for your development workflow.',
    url: 'https://skills.n3wth.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About AI Skills — What They Are and How They Work',
    description:
      'Learn what AI coding skills are and how they work with Gemini CLI, Cursor, and other assistants.',
  },
}

export default function AboutPage() {
  return (
    <>
      <WebPageJsonLd
        title="About AI Skills"
        description="Learn what AI coding skills are, how they work with Gemini CLI, Cursor, and other assistants, and when to use them vs MCP servers."
        url="https://skills.n3wth.com/about"
        breadcrumbs={[
          { name: 'Home', url: 'https://skills.n3wth.com' },
          { name: 'About', url: 'https://skills.n3wth.com/about' },
        ]}
      />
      <AboutClient />
    </>
  )
}
