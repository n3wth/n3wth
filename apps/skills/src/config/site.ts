import { siteUrls } from '@n3wth/site-config'
// Site-wide configuration
export const siteConfig = {
  name: 'Agent Skills',
  description: 'Markdown skills for coding agents.',
  tagline: 'One install, local, offline.',
  author: 'Oliver Newth',
  links: {
    about: siteUrls.home,
    github: 'https://github.com/n3wth/n3wth/tree/main/apps/skills',
    twitter: 'https://twitter.com/olivernewth',
    terms: `${siteUrls.home}/terms`,
    docs: 'https://github.com/n3wth/n3wth/tree/main/apps/skills#readme',
  },
  hero: {
    title: ['Agent Skills'],
  },
  sections: {
    install: {
      title: 'Install',
      subtitle: 'One command. Works with Antigravity CLI.',
    },
    browse: {
      title: 'Browse Skills',
    },
  },
  seo: {
    keywords: [
      'AI coding skills',
      'Antigravity CLI extensions',
      'AI assistant plugins',
      'Antigravity CLI skills',
      'AI tools',
      'developer productivity',
      'workflow automation',
      'AI coding skills',
    ],
    regions: ['us', 'uk', 'eu', 'au'],
  },
}
