import starlight from '@astrojs/starlight'
import { googleAnalyticsScript } from '@n3wth/site-config/analytics'

export default function docs() {
  return starlight({
    title: 'n3wth docs',
    description: 'Developer documentation for @n3wth/ui, Elephant-Goldfish, and the r3 memory server.',
    favicon: '/favicon.svg',
    disable404Route: true,
    components: { Head: './src/components/docs/Head.astro' },
    customCss: ['./src/styles/docs.css'],
    head: [
      { tag: 'script', content: googleAnalyticsScript },
      { tag: 'meta', attrs: { property: 'og:image', content: 'https://n3wth.com/og-image.png' } },
      { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://n3wth.com/og-image.png' } },
      { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    ],
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/n3wth/n3wth' }],
    editLink: { baseUrl: 'https://github.com/n3wth/n3wth/edit/main/apps/portfolio/' },
    sidebar: [
      { label: 'Overview', slug: 'docs' },
      { label: 'Contribute', items: ['docs/workspace', 'docs/publishing'] },
      { label: 'UI', items: [{ autogenerate: { directory: 'docs/ui' } }] },
      { label: 'Elephant-Goldfish', items: [{ autogenerate: { directory: 'docs/elephant-goldfish' } }] },
      { label: 'r3', items: [{ autogenerate: { directory: 'docs/r3' } }] },
      { label: 'Back to n3wth.com', link: '/' },
    ],
  })
}
