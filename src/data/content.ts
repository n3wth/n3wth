export const siteConfig = {
  name: 'Oliver Newth',
  title: 'Oliver Newth - AI Product Leader',
  description: 'AI product leader building at the intersection of trust, collaboration, and creative practice. Google I/O speaker.',
  email: 'oliver@newth.ai',
  social: {
    github: 'https://github.com/n3wth',
    linkedin: 'https://linkedin.com/in/olivernewth',
  },
  artSite: 'https://newth.art',
}

/** Proof points surfaced in the hero — sourced from the experience records below. */
export const heroStats: Metric[] = [
  { value: '10+', label: 'Years shipping AI' },
  { value: '750M', label: 'Daily users served' },
  { value: '50+', label: 'Enterprise deployments' },
  { value: 'I/O 2025', label: 'Google speaker' },
]

export interface NavItem {
  name: string
  href: string
  external?: boolean
}

export const navigation: NavItem[] = [
  { name: 'Work', href: '#work' },
  { name: 'Building', href: '#building' },
  { name: 'After dark', href: '#creative' },
  { name: 'Thinking', href: '#thinking' },
  { name: 'Alignment', href: '#ai-explainer' },
  { name: 'Contact', href: '#contact' },
]

export interface Metric {
  value: string
  label: string
}

export interface Experience {
  id: string
  company: string
  role: string
  period: string
  /** One confident line — the ship log reads like an index, not a résumé. */
  summary: string
  metric?: Metric
}

export const experiences: Experience[] = [
  {
    id: 'google',
    company: 'Google',
    role: 'AI Product Leader',
    period: '2024 —',
    summary:
      'Gemini-powered products across Google’s GenAI platform, working with DeepMind. Spoke at I/O 2025 on responsible AI in production.',
    metric: { value: 'I/O 2025', label: 'Speaker' },
  },
  {
    id: 'covariant',
    company: 'Covariant',
    role: 'Senior Product Manager',
    period: '2022 – 24',
    summary:
      'Computer vision from research demos to warehouse floors running 24/7 — then through Amazon’s acquisition.',
    metric: { value: '50+', label: 'Enterprise deployments' },
  },
  {
    id: 'meta',
    company: 'Meta',
    role: 'Product Manager, Instagram',
    period: '2019 – 22',
    summary:
      'Launched video calling on Instagram. At that scale, latency and reliability are the product.',
    metric: { value: '750M', label: 'Daily users' },
  },
  {
    id: 'microsoft',
    company: 'Microsoft',
    role: 'Product Manager, Azure',
    period: '2016 – 19',
    summary:
      'Built Azure Cognitive Services and the playbook for enterprise AI adoption — trust as the thing being shipped.',
    metric: { value: '1M+', label: 'API calls / day' },
  },
]

export interface Installation {
  id: string
  title: string
  tagline: string
  year: string
  location: string
  type: 'burning-man' | 'public-art' | 'memorial' | 'interactive'
  image: string
  imageAlt: string
  lightBg?: boolean
}

export const installations: Installation[] = [
  {
    id: 'them',
    title: 'THEM',
    tagline: '30-foot interactive light sculpture for 70,000 attendees',
    year: '2019',
    location: 'Black Rock City, Nevada',
    type: 'burning-man',
    image: '/images/installations/them.webp',
    imageAlt: 'THEM sculpture at Burning Man casting dramatic shadows on desert floor',
    lightBg: true,
  },
  {
    id: 'pink-triangle',
    title: 'Pink Triangle',
    tagline: 'Illuminated LGBTQIA+ memorial on Twin Peaks during Pride Month',
    year: '2022',
    location: 'San Francisco, California',
    type: 'memorial',
    image: '/images/installations/pink-triangle.webp',
    imageAlt: 'Pink Triangle LED installation illuminating Twin Peaks during Pride Month',
  },
  {
    id: 'circle-of-light',
    title: 'Circle of Light',
    tagline: 'World AIDS Day memorial installation',
    year: '2021',
    location: 'San Francisco, California',
    type: 'memorial',
    image: '/images/installations/circle-of-light.webp',
    imageAlt: 'Circle of Light illuminated memorial in Golden Gate Park',
  },
]

export interface Project {
  id: string
  name: string
  description: string
  tech: string[]
  url: string
  github?: string
}

export const projects: Project[] = [
  {
    id: 'r3',
    name: 'r3',
    description: 'Give any AI app persistent memory. Vector search, entity extraction, knowledge graphs -- zero config.',
    tech: ['TypeScript', 'Redis', 'Vector Embeddings', 'MCP'],
    url: 'https://r3.newth.ai',
    github: 'https://github.com/n3wth/r3',
  },
  {
    id: 'kit',
    name: 'kit',
    description: '47 components with AI context packs. Ships your design system to v0, Cursor, and Claude Code.',
    tech: ['React', 'Tailwind v4', 'Radix', 'shadcn'],
    url: 'https://kit.newth.ai',
    github: 'https://github.com/n3wth/kit',
  },
  {
    id: 'hop-flights',
    name: 'hop.flights',
    description: 'AI points-vs-cash flight optimizer and travel companion -- finds the cheapest way to fly, miles or money.',
    tech: ['Next.js', 'AI SDK', 'Duffel'],
    url: 'https://hop.flights',
  },
  {
    id: 'skills',
    name: 'skills',
    description: 'A registry of markdown skills for Gemini CLI and Claude Code. Install with one command.',
    tech: ['Next.js', 'React', 'Supabase'],
    url: 'https://skills.n3wth.com',
    github: 'https://github.com/n3wth/skills',
  },
  {
    id: 'garden',
    name: 'garden',
    description: 'A digital garden of interconnected notes -- Obsidian-flavored markdown rendered as a living wiki.',
    tech: ['Next.js', 'Astryx', 'Wikilinks'],
    url: 'https://garden.n3wth.com',
  },
]
