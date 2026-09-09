import type { Metadata } from 'next'
import { InstallationGuide } from '../../_components/installation-guide'

export const metadata: Metadata = { title: 'AI context', description: 'Install registry components and add Antigravity CLI project context.' }

export default function Guide() {
  return <InstallationGuide title="AI context" />
}
