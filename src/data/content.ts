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
  { name: 'Thinking', href: '#thinking' },
  { name: 'Alignment', href: '#ai-explainer' },
  { name: 'Creative', href: '#creative' },
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
  description: string
  tech: string[]
  metric?: Metric
  businessContext?: string
  decision?: string
  businessOutcome?: string
  strategicLesson?: string
}

export const experiences: Experience[] = [
  {
    id: 'google',
    company: 'Google',
    role: 'AI Product Leader',
    period: '2024 - Present',
    description: 'Shipping Gemini-powered products across Google\'s GenAI platform. Working at the intersection of Gemini, PaLM 2, and Imagen models with DeepMind collaboration. Google I/O 2025 speaker on responsible AI deployment in production.',
    tech: ['GenAI', 'Trust & Safety', 'Responsible AI', 'Large Language Models'],
    metric: { value: 'I/O 2025', label: 'Speaker' },
    businessContext: '[OLIVER: 1 sentence on the business state before]',
    decision: '[OLIVER: 1-2 sentences on the call Oliver made + trade-offs]',
    businessOutcome: '[OLIVER: revenue / cost / retention numbers (real, not hand-wavy)]',
    strategicLesson: '[OLIVER: 1 sentence on what this says about Oliver as a leader]',
  },
  {
    id: 'covariant',
    company: 'Covariant',
    role: 'Senior Product Manager',
    period: '2022 - 2024',
    description: 'AI that touches the physical world. Took computer vision from research demos to warehouse floors running 24/7 across 50+ enterprise deployments, then navigated the company through Amazon\'s acquisition.',
    tech: ['Computer Vision', 'Robotics', 'Enterprise AI', 'M&A'],
    metric: { value: '50+', label: 'Enterprise deployments' },
    businessContext: '[OLIVER: 1 sentence on the business state before]',
    decision: '[OLIVER: 1-2 sentences on the call Oliver made + trade-offs]',
    businessOutcome: '[OLIVER: revenue / cost / retention numbers (real, not hand-wavy)]',
    strategicLesson: '[OLIVER: 1 sentence on what this says about Oliver as a leader]',
  },
  {
    id: 'meta',
    company: 'Meta',
    role: 'Product Manager, Instagram',
    period: '2019 - 2022',
    description: 'Launched video calling on Instagram to 750 million daily users. At that scale, low latency and reliability were the product, so most of the work was in the real-time infrastructure behind the feature.',
    tech: ['Real-time Systems', 'Consumer Social', 'Scale Infrastructure'],
    metric: { value: '750M', label: 'Daily active users' },
    businessContext: '[OLIVER: 1 sentence on the business state before]',
    decision: '[OLIVER: 1-2 sentences on the call Oliver made + trade-offs]',
    businessOutcome: '[OLIVER: revenue / cost / retention numbers (real, not hand-wavy)]',
    strategicLesson: '[OLIVER: 1 sentence on what this says about Oliver as a leader]',
  },
  {
    id: 'microsoft',
    company: 'Microsoft',
    role: 'Product Manager, Azure',
    period: '2016 - 2019',
    description: 'Built Azure Cognitive Services APIs used by millions of developers and set the playbook for enterprise AI adoption. Developer platforms live or die on reliability and clear contracts, so trust was the main thing I was shipping.',
    tech: ['Developer Platforms', 'Cognitive Services', 'Enterprise AI'],
    metric: { value: '1M+', label: 'API calls per day' },
    businessContext: '[OLIVER: 1 sentence on the business state before]',
    decision: '[OLIVER: 1-2 sentences on the call Oliver made + trade-offs]',
    businessOutcome: '[OLIVER: revenue / cost / retention numbers (real, not hand-wavy)]',
    strategicLesson: '[OLIVER: 1 sentence on what this says about Oliver as a leader]',
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
    id: 'proof-sdk',
    name: 'Proof SDK',
    description: 'Open-source editor where every change has an author -- human or AI. Provenance built in.',
    tech: ['TypeScript', 'Tiptap', 'WebSocket', 'SQLite'],
    url: 'https://github.com/n3wth/proof-sdk',
  },
  {
    id: 'skills',
    name: 'skills',
    description: 'A registry of markdown skills for Gemini CLI and Claude Code. Install with one command.',
    tech: ['Next.js', 'React', 'Supabase'],
    url: 'https://skills.n3wth.com',
    github: 'https://github.com/n3wth/skills',
  },
]
