import AssistantSmsPage, { type AssistantSmsLine } from '../components/AssistantSmsPage'

const BILLY: AssistantSmsLine = {
  name: 'Billy',
  slug: 'billy',
  number: '+14157180992',
  display: '+1 (415) 718-0992',
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
