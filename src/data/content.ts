export const siteConfig = {
  name: 'Oliver Newth',
  title: 'Oliver Newth — AI Product Lead at Google',
  description: 'AI product lead at Google. Ex-Covariant (acquired by Amazon), Meta, Microsoft. Ships with a standing agent team; builds large-scale light art.',
  email: 'hey@n3wth.com',
  social: {
    github: 'https://github.com/n3wth',
    linkedin: 'https://linkedin.com/in/newth',
  },
  gardenSite: 'https://garden.n3wth.com',
}

export interface NavItem {
  name: string
  href: string
  external?: boolean
}

export const navigation: NavItem[] = [
  { name: 'Work', href: '/work' },
  { name: 'Art', href: '/art' },
  { name: 'Thinking', href: '/thinking' },
  { name: 'Library', href: '/library' },
  { name: 'Contact', href: '/contact' },
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
    role: 'AI Product Lead',
    period: '2025 —',
    summary:
      'Platforms that put Google DeepMind models into products.',
  },
  {
    id: 'covariant',
    company: 'Covariant',
    role: 'Staff Product Manager',
    period: '2022 – 24',
    summary:
      'Took computer vision from research demos to warehouse floors running 24/7, through Amazon’s acquisition of the team in 2024.',
    metric: { value: '50+', label: 'Enterprise deployments' },
  },
  {
    id: 'meta',
    company: 'Meta',
    role: 'Product Manager',
    period: '2017 – 22',
    summary:
      'Ran video calling across Instagram and Portal; before that, core growth and integrity.',
    metric: { value: '2020', label: 'Build Social Value Award' },
  },
  {
    id: 'microsoft',
    company: 'Microsoft',
    role: 'Product Manager, Azure',
    period: '2014 – 17',
    summary:
      'Product on Azure Cognitive Services; the job was getting enterprises to trust AI enough to adopt it.',
    metric: { value: '100M+', label: 'API requests / day' },
  },
]

/** One quiet line under the ship log — the foundation before it. */
export const education =
  'Before the ship log: MIT MEng in High Performance Structures (Kennedy Scholar); Warwick Civil Engineering, First Class.'

export interface CreditLink {
  /** Must appear verbatim in the installation's tagline. */
  text: string
  href: string
}

export interface Installation {
  id: string
  title: string
  /** Credits only — place detail belongs in `location`. */
  tagline: string
  /** Institutions named in the tagline that have a public URL to point at. */
  creditLinks?: CreditLink[]
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
    tagline:
      'Lighting and Circle of Light ring. Design: Simón Malvaez. Fabrication: Brenden Blaine Darby. Fractured Atlas',
    creditLinks: [
      {
        text: 'Fractured Atlas',
        href: 'https://fundraising.fracturedatlas.org/them-a-burning-man-art-piece',
      },
    ],
    year: '2022',
    location: 'Black Rock City, Nevada',
    type: 'burning-man',
    image: '/images/installations/them.webp',
    imageAlt: 'THEM sculpture at Burning Man casting dramatic shadows on desert floor',
    lightBg: true,
  },
  {
    id: 'pink-triangle',
    title: 'Pink Triangle',
    tagline:
      'Project coordination as part of Illuminate on Patrick Carney’s Pride memorial.',
    creditLinks: [
      {
        text: 'Illuminate',
        href: 'https://illuminate.org/projects/the-pink-triangle/',
      },
    ],
    year: '2022',
    location: 'Twin Peaks, San Francisco',
    type: 'memorial',
    image: '/images/installations/pink-triangle.webp',
    imageAlt: 'Pink Triangle LED installation illuminating Twin Peaks during Pride Month',
  },
  {
    id: 'circle-of-light',
    title: 'Circle of Light',
    tagline: 'World AIDS Day memorial for the National AIDS Memorial.',
    creditLinks: [
      {
        text: 'National AIDS Memorial',
        href: 'https://www.aidsmemorial.org/grove',
      },
    ],
    year: '2021',
    location: 'AIDS Memorial Grove, San Francisco',
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
    description: 'Give any AI app persistent memory. Vector search and knowledge graphs, no config.',
    tech: ['TypeScript', 'Redis', 'Vector Embeddings', 'MCP'],
    url: 'https://r3.n3wth.com',
    github: 'https://github.com/n3wth/r3',
  },
  {
    id: 'kit',
    name: 'kit',
    description: '49 components with AI context packs. Ships your design system straight to your editor and coding agents.',
    tech: ['React', 'Tailwind v4', 'Radix', 'shadcn'],
    url: 'https://kit.n3wth.com',
    github: 'https://github.com/n3wth/kit',
  },
  {
    id: 'hop-flights',
    name: 'hop.flights',
    description: 'Points-vs-cash flight optimizer — finds the cheapest way to fly, miles or money.',
    tech: ['Next.js', 'AI SDK', 'Duffel'],
    url: 'https://hop.flights',
  },
  {
    id: 'skills',
    name: 'skills',
    description: 'A registry of markdown skills for Gemini CLI and other coding agents. Install with one command.',
    tech: ['Next.js', 'React', 'Supabase'],
    url: 'https://skills.n3wth.com',
    github: 'https://github.com/n3wth/skills',
  },
  {
    id: 'garden',
    name: 'garden',
    description: 'A digital garden: Obsidian-flavored markdown rendered as a wiki, every note linked.',
    tech: ['Next.js', 'Astryx', 'Wikilinks'],
    url: 'https://garden.n3wth.com',
  },
]
