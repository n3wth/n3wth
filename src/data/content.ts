export const siteConfig = {
  name: 'Oliver Newth',
  title: 'Oliver Newth - AI Product Leader',
  description: 'AI safety and Trust & Safety at billion-user scale. Google I/O speaker.',
  email: 'oliver@newth.ai',
  social: {
    github: 'https://github.com/n3wth',
    linkedin: 'https://linkedin.com/in/newth',
  },
  artSite: 'https://newth.art',
}

export interface NavItem {
  name: string
  href: string
  external?: boolean
}

export const navigation: NavItem[] = [
  { name: 'Work', href: '#work' },
  { name: 'Frameworks', href: '#frameworks' },
  { name: 'Creative', href: '#creative' },
  { name: 'Skills', href: 'https://skills.n3wth.com', external: true },
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
    role: 'AI Product Leader',
    period: '2024 - Present',
    description: 'Bringing AI systems from research to production at billion-user scale. Google I/O 2025 speaker.',
    achievements: [
      'Shipped Opal, a no-code GenAI product',
      'Google I/O 2025 speaker on responsible AI deployment',
      'Led Trust & Safety AI initiatives',
    ],
    tech: ['Gemini', 'Vertex AI', 'Trust & Safety', 'BigQuery'],
  },
  {
    id: 'covariant',
    company: 'Covariant',
    role: 'Senior Product Manager',
    period: '2022 - 2024',
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
    role: 'Product Manager',
    period: 'Instagram',
    description: 'Instagram Calling. Launched video calling to 750M daily active users.',
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
    role: 'Product Manager',
    period: 'Azure',
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
    id: 'trust-safety',
    title: 'Safety is a feature',
    tagline: 'Users don\'t see the harm you prevented. But they feel it when you fail. I build AI that earns trust at scale.',
    category: 'reliability',
    color: 'gold',
  },
  {
    id: 'ml-platform',
    title: 'Platforms over products',
    tagline: 'A single ML product serves one team. A platform multiplies impact across the organization. Always build the platform.',
    category: 'architecture',
    color: 'violet',
  },
  {
    id: 'ai-operations',
    title: 'Observability is product',
    tagline: 'You can\'t improve what you can\'t see. The best AI teams treat monitoring dashboards like user-facing features.',
    category: 'operations',
    color: 'gold',
  },
  {
    id: 'product-strategy',
    title: 'Ship the learning, not the model',
    tagline: 'Models depreciate. Learning compounds. Build systems that get smarter from every user interaction.',
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
  image: string
  imageAlt: string
  lightBg?: boolean
}

export const installations: Installation[] = [
  {
    id: 'pink-triangle',
    title: 'Pink Triangle',
    tagline: 'Illuminated landmark honoring LGBTQ+ history',
    year: '2022',
    location: 'San Francisco, CA',
    type: 'memorial',
    image: '/images/installations/pink-triangle.webp',
    imageAlt: 'Pink Triangle LED installation illuminating Twin Peaks during Pride Month',
  },
  {
    id: 'them',
    title: 'THEM',
    tagline: '30-foot interactive light sculpture',
    year: '2019',
    location: 'Black Rock City, NV',
    type: 'burning-man',
    image: '/images/installations/them.jpg',
    imageAlt: 'THEM sculpture at Burning Man casting dramatic shadows on desert floor',
    lightBg: true,
  },
  {
    id: 'circle-of-light',
    title: 'Circle of Light',
    tagline: 'World AIDS Day memorial installation',
    year: '2021',
    location: 'San Francisco, CA',
    type: 'memorial',
    image: '/images/installations/circle-of-light.webp',
    imageAlt: 'Circle of Light illuminated memorial in Golden Gate Park',
  },
]
