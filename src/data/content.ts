export const siteConfig = {
  name: 'Oliver Newth',
  title: 'Oliver Newth - AI Product Leader',
  description: 'Product strategy for AI at billion-user scale',
  email: 'oliver@newth.ai',
  social: {
    twitter: 'https://twitter.com/olivernewth',
    github: 'https://github.com/n3wth',
    linkedin: 'https://linkedin.com/in/olivernewth',
  },
  artSite: 'https://newth.art',
}

export const navigation = [
  { name: 'Work', href: '#work' },
  { name: 'Frameworks', href: '#frameworks' },
  { name: 'Creative', href: '#creative' },
  { name: 'Contact', href: '#contact' },
]

export interface Experience {
  id: string
  company: string
  role: string
  period: string
  description: string
  achievements: string[]
  tech: string[]
}

export const experiences: Experience[] = [
  {
    id: 'google',
    company: 'Google',
    role: 'Group Product Manager, ML Platform & Infrastructure',
    period: '2022 - Present',
    description: 'Managing $500M+ value platform across 100+ products. Defining vision and aligning executives for AI platforms serving billions.',
    achievements: [
      'Unified ML platform architecture across organization',
      'Led cross-functional team of 50+ engineers',
      'Drove 3x improvement in model deployment velocity',
    ],
    tech: ['ML Infrastructure', 'TensorFlow', 'Vertex AI', 'BigQuery'],
  },
  {
    id: 'covariant',
    company: 'Covariant (Amazon acquisition)',
    role: 'Director of Product',
    period: '2020 - 2022',
    description: 'Vision AI & Robotics. Led product strategy through acquisition by Amazon.',
    achievements: [
      'Scaled from 5 to 50+ enterprise deployments',
      'Built real-time computer vision pipeline',
      'Achieved 99.9% uptime for production systems',
    ],
    tech: ['Computer Vision', 'Robotics', 'PyTorch', 'ROS'],
  },
  {
    id: 'meta',
    company: 'Meta',
    role: 'Lead Product Manager',
    period: '2017 - 2020',
    description: 'Instagram Calling. Launched video calling to 750M daily active users in 6 months.',
    achievements: [
      '0 to 75% DAU adoption in 6 months',
      'Built real-time communication infrastructure',
      'Led team through hypergrowth phase',
    ],
    tech: ['WebRTC', 'Mobile', 'Real-time Systems', 'A/B Testing'],
  },
  {
    id: 'microsoft',
    company: 'Microsoft',
    role: 'Senior Product Manager',
    period: '2014 - 2017',
    description: 'Azure Cognitive Services. Built AI services used by millions of developers.',
    achievements: [
      'Launched Computer Vision API to general availability',
      'Grew to 1M+ API calls per day',
      'Established enterprise AI adoption playbook',
    ],
    tech: ['Azure', 'Cognitive Services', 'REST APIs', 'Enterprise AI'],
  },
]

export interface Framework {
  id: string
  title: string
  tagline: string
  category: 'reliability' | 'architecture' | 'operations' | 'strategy'
  color: string
}

export const frameworks: Framework[] = [
  {
    id: 'agent-reliability',
    title: 'Agent Reliability Patterns',
    tagline: 'Five patterns for production AI agents',
    category: 'reliability',
    color: 'gold',
  },
  {
    id: 'ml-platform',
    title: 'ML Platform Architecture',
    tagline: 'Building platforms that scale',
    category: 'architecture',
    color: 'violet',
  },
  {
    id: 'ai-operations',
    title: 'AI Operations Playbook',
    tagline: 'Running AI systems at scale',
    category: 'operations',
    color: 'gold',
  },
  {
    id: 'product-strategy',
    title: 'AI Product Strategy',
    tagline: 'From prototype to production',
    category: 'strategy',
    color: 'violet',
  },
]

export interface Installation {
  id: string
  title: string
  tagline: string
  year: string
  location: string
  type: 'burning-man' | 'public-art' | 'memorial' | 'interactive'
}

export const installations: Installation[] = [
  {
    id: 'pink-triangle',
    title: 'Pink Triangle',
    tagline: 'Illuminated landmark honoring LGBTQ+ history',
    year: '2022',
    location: 'San Francisco, CA',
    type: 'memorial',
  },
  {
    id: 'them',
    title: 'THEM',
    tagline: '30-foot interactive light sculpture',
    year: '2019',
    location: 'Black Rock City, NV',
    type: 'burning-man',
  },
  {
    id: 'circle-of-light',
    title: 'Circle of Light',
    tagline: 'World AIDS Day memorial installation',
    year: '2021',
    location: 'San Francisco, CA',
    type: 'memorial',
  },
]
