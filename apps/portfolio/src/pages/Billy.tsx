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
      <circle cx="256" cy="256" r="72" fill="#fff" />
    </g>
  ),
}

export default function Billy() {
  return <AssistantSmsPage line={BILLY} />
}
