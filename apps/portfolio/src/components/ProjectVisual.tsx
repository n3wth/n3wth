import { useState } from 'react'
import { PanelsTopLeft, FileText, Braces } from 'lucide-react'
import { Button, CheckboxInput, Switch, TextInput } from '@n3wth/ui/primitives'
import './project-pages.css'

/** Explanatory specimens, not simulated product interfaces. */
export function ProjectVisual({ slug }: { slug: string }) {
  const [checked, setChecked] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const [sample, setSample] = useState('Interface')
  return <figure className={`project-visual project-visual--${slug}`}>
    {slug === 'r3' ? <>
      <div className="project-memory">
        <p className="project-memory-question">“Why did we pick this database?”</p>
        <svg viewBox="0 0 320 230" role="img" aria-label="Example knowledge graph: the app uses SQLite, which supports offline use.">
          <g fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5">
            <path d="M100 48 C145 48 165 48 210 48" />
            <path d="M260 70 C260 130 190 105 190 167" />
            <path d="M60 70 C60 135 100 135 130 183" strokeDasharray="3 5" />
          </g>
          <g fill="var(--color-background-surface)" stroke="var(--color-border-emphasized)">
            <rect x="10" y="25" width="90" height="46" rx="8" />
            <rect x="210" y="25" width="100" height="46" rx="8" />
            <rect x="106" y="167" width="145" height="46" rx="8" stroke="var(--color-text-secondary)" />
          </g>
          <g fill="var(--color-text-primary)" fontSize="16" textAnchor="middle">
            <text x="55" y="54">The app</text>
            <text x="260" y="54">SQLite</text>
            <text x="178" y="196">Offline use</text>
          </g>
          <g fill="var(--color-text-secondary)" fontSize="13" textAnchor="middle">
            <text x="155" y="37">uses</text>
            <text x="266" y="135">supports</text>
          </g>
        </svg>
        <p className="project-memory-result">SQLite was chosen for offline use.</p>
      </div>
    </> : slug === 'ui' ? <>
      <div className="project-system-specimen" aria-label="Design system examples">
        <div className="project-type-specimen" aria-label="Type scale">
          <span className="project-type-sample">{sample || 'Interface'}</span>
          <span className="project-type-medium">{sample || 'Interface'}</span>
          <span className="project-type-small">{sample || 'Interface'}</span>
        </div>
        <div className="project-swatches" aria-label="Neutral and semantic color tokens" role="img"><i /><i /><i /><i /><i /><i /></div>
        <div className="project-control-specimen">
          <Button label="Components" variant="primary" href="https://docs.n3wth.com/ui/primitives" />
          <Button label="Reset" variant="secondary" clickAction={() => { setSample('Interface'); setChecked(true); setEnabled(true) }} />
        </div>
        <div className="project-input-specimen"><TextInput label="Type sample" isLabelHidden placeholder="Type something" value={sample} onChange={setSample} /></div>
        <div className="project-selection-specimen">
          <CheckboxInput label="Selected" value={checked} onChange={setChecked} />
          <Switch label="Enabled" value={enabled} onChange={setEnabled} />
        </div>
      </div>
    </> : <>
      <ul className="project-skill-collection">
        <li><a href="https://skills.n3wth.com/skill/frontend-design"><PanelsTopLeft aria-hidden="true" /><span><strong>Frontend Design</strong><span>Build React interfaces with clear type and spacing.</span></span></a></li>
        <li><a href="https://skills.n3wth.com/skill/pdf"><FileText aria-hidden="true" /><span><strong>PDF Toolkit</strong><span>Extract tables, merge files, and process forms.</span></span></a></li>
        <li><a href="https://skills.n3wth.com/skill/webapp-testing"><Braces aria-hidden="true" /><span><strong>Webapp Testing</strong><span>Test local apps and capture browser screenshots.</span></span></a></li>
      </ul>
    </>}
  </figure>
}
