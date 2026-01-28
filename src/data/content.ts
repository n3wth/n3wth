export const siteConfig = {
  name: 'Oliver Newth',
  title: 'Oliver Newth - AI Product Leader',
  description: 'AI safety and Trust & Safety at billion-user scale. Google I/O speaker.',
  email: 'oliver@newth.ai',
  social: {
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
    role: 'Group Product Manager, Trust & Safety AI',
    period: '2022 - Present',
    description: 'Integrating DeepMind models into Google products at billion-user scale. Presented at Google I/O on AI safety.',
    achievements: [
      'Shipped DeepMind model integrations across Google surfaces',
      'Led Trust & Safety AI platform serving billions',
      'Google I/O 2024 speaker on responsible AI deployment',
    ],
    tech: ['DeepMind', 'Trust & Safety', 'Vertex AI', 'BigQuery'],
  },
  {
    id: 'covariant',
    company: 'Covariant',
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
