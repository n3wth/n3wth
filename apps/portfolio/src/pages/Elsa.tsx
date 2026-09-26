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
      <g transform="rotate(28 256 256)">
        <rect x="204" y="96" width="104" height="320" rx="52" fill="#fff" />
        <rect className="assistant-eye" x="230" y="146" width="16" height="42" rx="8" fill="#000" />
        <rect className="assistant-eye" x="266" y="146" width="16" height="42" rx="8" fill="#000" />
      </g>
    </g>
  ),
}

export default function Elsa() {
  return <AssistantSmsPage line={ELSA} />
}
