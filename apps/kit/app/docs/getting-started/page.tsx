import type { Metadata } from 'next'
import { pageMetadata } from '@n3wth/site-config/metadata'
import { InstallationGuide } from '../../_components/installation-guide'

export const metadata: Metadata = pageMetadata({ title: 'Getting started', description: 'Install registry components and add Antigravity CLI project context.', url: 'https://kit.n3wth.com/docs/getting-started' })

export default function Guide() {
  return <InstallationGuide title="Getting started" />
}
