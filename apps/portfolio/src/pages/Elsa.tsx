import AssistantSmsPage, { type AssistantSmsLine } from '../components/AssistantSmsPage'

const ELSA: AssistantSmsLine = {
  name: 'Elsa',
  slug: 'elsa',
  number: '+14157180992',
  display: '+1 (415) 718-0992',
  subject: 'She',
  object: 'her',
  glyph: (
    <g className="elsa-slash">
      <rect x="236" y="96" width="40" height="320" rx="20" fill="#fff" transform="rotate(28 256 256)" />
    </g>
  ),
}

export default function Elsa() {
  return <AssistantSmsPage line={ELSA} />
}
