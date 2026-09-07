import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch about AI skills for Gemini CLI, Cursor, and other assistants. Report issues, request features, or contribute to the skills directory.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact',
    description: 'Get in touch about AI skills for Gemini CLI, Cursor, and other assistants. Report issues, request features, or contribute to the skills directory.',
    url: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
