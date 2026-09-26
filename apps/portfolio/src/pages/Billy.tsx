import AssistantSmsPage, { type AssistantSmsLine } from '../components/AssistantSmsPage'

const BILLY: AssistantSmsLine = {
  name: 'Billy',
  slug: 'billy',
  number: '+14632588004',
  display: '+1 (463) 258-8004',
  subject: 'Billy',
  object: 'Billy',
  glyph: (
    <g className="billy-dot">
      <circle cx="256" cy="256" r="124" fill="#fff" />
      <rect className="assistant-eye" x="252" y="200" width="18" height="48" rx="9" fill="#000" transform="rotate(12 261 224)" />
      <rect className="assistant-eye" x="296" y="200" width="18" height="48" rx="9" fill="#000" transform="rotate(12 305 224)" />
    </g>
  ),
}

export default function Billy() {
  return <AssistantSmsPage line={BILLY} />
}
