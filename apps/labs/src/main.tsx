import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { N3wthProvider, PageHeader, SiteContainer, SiteSection, SiteHeading, SiteText, SiteNavigation, SiteFooter } from '@n3wth/ui/site'
import { Button, TextInput, TextArea, Slider, NumberInput } from '@n3wth/ui/primitives'
import { initialDecision, initialExperiment, initialCritique, rankDecision, lenses, type Decision, type Experiment, type Critique } from './model'
import '@n3wth/ui/site.css'
import './styles.css'

const tools = [
  { id: 'decide', number: '01', name: 'Decision lab', desc: 'Make the tradeoffs visible.' },
  { id: 'experiment', number: '02', name: 'Experiment planner', desc: 'Find the smallest useful test.' },
  { id: 'critique', number: '03', name: 'Product lens', desc: 'Turn a reaction into evidence.' },
] as const
type ToolId = typeof tools[number]['id']
const readTool = (): ToolId => tools.find(t => t.id === location.hash.slice(1))?.id ?? 'decide'
const clean = (s: string, fallback: string) => s.trim() || fallback

function Download({ title, body, disabled = false }: { title: string; body: string; disabled?: boolean }) {
  const [saved, setSaved] = useState(false)
  useEffect(() => setSaved(false), [body])
  function download() {
    const blob = new Blob([`# ${title}\n\n${body}\n\n---\nMade with n3wth Lab · https://labs.n3wth.com\n`], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `n3wth-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); setSaved(true)
  }
  return <div className="download"><Button label="Save result" variant="primary" size="lg" onClick={download} isDisabled={disabled} /><span role="status" className="muted">{saved ? 'Downloaded as Markdown.' : 'A file you can keep and edit.'}</span></div>
}
function Method({ children }: { children: React.ReactNode }) {
  return <details className="method"><summary>The thinking behind this tool</summary><SiteText>{children}</SiteText></details>
}
function DecisionTool({ d, set }: { d: Decision; set: (d: Decision) => void }) {
  const rank = rankDecision(d), total = d.weights.reduce((a, b) => a + b, 0)
  const tied = Math.abs(rank[0].score - rank[1].score) < .00001
  const body = `${d.question}\n\n## Ranking\n${rank.map((r, i) => `${i + 1}. ${r.name}: ${r.score.toFixed(2)}/10`).join('\n')}\n\n## Criteria and weights\n${d.criteria.map((c,i) => `- ${c || `Criterion ${i+1}`}: ${d.weights[i]} (${total ? Math.round(d.weights[i]/total*100) : 0}%)`).join('\n')}\n\n## Scores\n${d.options.map((o,i)=>`${o || `Option ${i+1}`}\n${d.criteria.map((c,j)=>`- ${c || `Criterion ${j+1}`}: ${d.scores[i][j]}/10`).join('\n')}`).join('\n\n')}\n\nScores reflect your estimates, not measured outcomes. Test the assumptions behind the result.`
  return <>
    <div className="work-grid">
      <div className="editor">
        <TextInput label="Your decision" value={d.question} onChange={question => set({ ...d, question })} size="lg" width="100%" />
        <div className="field-intro"><SiteHeading level={3} variant="item">What matters?</SiteHeading><SiteText variant="supporting">Rename the criteria. Set their relative importance.</SiteText></div>
        <div className="criteria">{d.criteria.map((criterion, i) => <div className="criterion" key={i}>
          <TextInput label={`Criterion ${i + 1}`} isLabelHidden value={criterion} onChange={v => set({ ...d, criteria: d.criteria.map((c,j) => j === i ? v : c) })} size="lg" width="100%" />
          <Slider label={`${criterion || `Criterion ${i+1}`} importance`} isLabelHidden min={0} max={100} step={5} value={d.weights[i]} onChange={(v: number) => set({ ...d, weights: d.weights.map((w,j) => j === i ? v : w) })} valueDisplay="none" width="100%" />
          <span className="numeric">{total ? Math.round(d.weights[i] / total * 100) : 0}%</span>
        </div>)}</div>
        <div className="field-intro"><SiteHeading level={3} variant="item">Score your options</SiteHeading><SiteText variant="supporting">0 = weakest, 10 = strongest. For effort or risk, a higher score means easier or safer.</SiteText></div>
        <div className="option-grid">{d.options.map((option, i) => <div className="option" key={i}>
          <TextInput label={`Option ${i+1}`} value={option} onChange={v => set({ ...d, options: d.options.map((o,j) => j === i ? v : o) })} size="lg" width="100%" />
          {d.criteria.map((criterion, j) => <NumberInput key={j} label={criterion || `Criterion ${j+1}`} aria-label={`${option || `Option ${i+1}`}: ${criterion || `Criterion ${j+1}`}`} min={0} max={10} step={1} value={d.scores[i][j]} onChange={v => set({ ...d, scores: d.scores.map((s,k) => k === i ? s.map((x,l) => l === j ? v : x) : s) })} size="lg" width="100%" />)}
        </div>)}</div>
      </div>
      <aside className="result" aria-label="Decision result">
        <div className="result-label">Your current result</div>
        <h3 className="result-title">{!total ? 'Give something weight.' : tied ? 'A close call.' : rank[0].name}</h3>
        <SiteText variant="supporting">{!total ? 'Increase at least one importance slider to compare your options.' : tied ? 'The leading options are tied. Revisit the criterion you are least certain about.' : `Leads by ${(rank[0].score - rank[1].score).toFixed(2)} points with these assumptions.`}</SiteText>
        <div className="ranking">{rank.map((r,i) => <div className="rank" key={r.index}>
          <div><span>{r.name}</span><strong className="numeric">{total ? r.score.toFixed(2) : '—'}<span className="muted"> / 10</span></strong></div>
          <div className="track"><div className={i === 0 ? 'bar leading' : 'bar'} style={{ width: `${r.score*10}%` }} /></div>
        </div>)}</div>
        <div className="result-note"><SiteHeading level={4} variant="item">Stress-test the answer</SiteHeading><SiteText variant="supporting">Move the importance slider you feel least sure about. If the winner changes, that assumption is worth investigating first.</SiteText></div>
        <Download title="Decision" body={body} disabled={!total} />
      </aside>
    </div>
    <Method>A weighted comparison makes your assumptions explicit. Scores are a weighted average on a 0–10 scale. The result helps identify the questions worth testing; it cannot account for a constraint or consequence you have left out.</Method>
  </>
}
function ExperimentTool({ d, set }: { d: Experiment; set: (d: Experiment) => void }) {
  const fields: [keyof Experiment, string, string][] = [
    ['audience', 'Who is this for?', 'Be specific about the people you want to learn from.'],
    ['problem', 'What problem do they have?', 'Describe an observed problem.'],
    ['intervention', 'What will you change?', 'Choose one intervention.'],
    ['behavior', 'What behavior would support your idea?', 'Choose an observable action.'],
    ['method', 'What is the smallest test?', 'Define what you will do and who will participate.'],
    ['threshold', 'What counts as success?', 'Set a number and a denominator before you start.'],
    ['duration', 'When will you review it?', 'A date or a fixed time window.'],
    ['failure', 'If it fails, what will you do?', 'Decide what you would change or investigate.'],
  ]
  const completed = fields.filter(([k]) => d[k].trim()).length
  const body = fields.map(([k,label]) => `## ${label}\n${clean(d[k], 'Not defined yet')}`).join('\n\n')
  return <><div className="work-grid"><div className="editor form-grid">{fields.map(([key,label,description]) => <TextArea key={key} label={label} description={description} value={d[key]} onChange={v => set({ ...d, [key]: v })} rows={2} width="100%" />)}</div>
    <aside className="result" aria-label="Experiment brief"><div className="result-label">Your experiment brief · {completed}/8</div><h3 className="result-title">Make it testable.</h3>
      <div className="brief"><span className="muted">Hypothesis</span><p>For <strong>{clean(d.audience, '[an audience]')}</strong>, {clean(d.intervention, '[an intervention]')} will help address: {clean(d.problem, '[a problem]')}</p>
      <span className="muted">Evidence to look for</span><p>{clean(d.behavior, 'Define one observable action.')}</p>
      <span className="muted">Run this test</span><p>{clean(d.method, 'Define the smallest useful test.')}</p>
      <span className="muted">Decision rule</span><p>Review after <strong>{clean(d.duration, '[a time window]')}</strong>. Continue if: <strong>{clean(d.threshold, '[a success threshold]')}</strong>.</p>
      <span className="muted">If it misses</span><p>{clean(d.failure, 'Define your next move before you start.')}</p></div>
      <Download title="Experiment brief" body={body} disabled={completed < 8} />{completed < 8 && <SiteText variant="supporting">Complete all eight fields to save your brief.</SiteText>}
    </aside></div><Method>Start with the uncertainty that could change your decision. Define the behavior, threshold, and next move before collecting evidence. A small test gives you direction; it does not establish statistical significance or prove that an idea will scale.</Method></>
}
function CritiqueTool({ d, set }: { d: Critique; set: (d: Critique) => void }) {
  const rated = d.ratings.map((v,i)=>({v,i})).filter(r=>r.v>0).sort((a,b)=>a.v-b.v)
  const weakest = rated[0]
  const body = `Product: ${clean(d.product,'Untitled product')}\n\n${lenses.map((l,i)=>`## ${l.name}\nRating: ${d.ratings[i] || 'Not rated'}/5\nEvidence: ${clean(d.evidence[i],'Not recorded')}\nSuggested test: ${l.test}`).join('\n\n')}\n\n## Next change\n${clean(d.next,'Not chosen yet')}`
  return <><div className="work-grid"><div className="editor"><TextInput label="Product or experience" placeholder="What are you reviewing?" value={d.product} onChange={product=>set({...d,product})} width="100%" size="lg" />
    {lenses.map((lens,i)=><section className="lens" key={lens.name}><div className="lens-heading"><SiteHeading level={3} variant="item">{lens.name}</SiteHeading><span className="muted">{d.ratings[i] ? `${d.ratings[i]}/5` : 'Not rated'}</span></div><SiteText>{lens.question}</SiteText>
    <div className="rating" role="group" aria-label={`${lens.name} rating`}>{[1,2,3,4,5].map(n=><Button key={n} label={`${lens.name}: ${n} of 5`} children={n} variant={d.ratings[i]===n?'primary':'secondary'} aria-pressed={d.ratings[i]===n} size="lg" onClick={()=>set({...d,ratings:d.ratings.map((r,j)=>j===i?(r===n?0:n):r)})} />)}<span className="muted">Weak to strong</span></div>
    <TextArea label={`${lens.name} evidence`} isLabelHidden placeholder="What did you observe?" value={d.evidence[i]} onChange={v=>set({...d,evidence:d.evidence.map((e,j)=>j===i?v:e)})} rows={2} width="100%" /></section>)}
    </div><aside className="result" aria-label="Critique result"><div className="result-label">Your review · {rated.length}/4 lenses</div><h3 className="result-title">{weakest ? `Start with ${lenses[weakest.i].name.toLowerCase()}.` : 'Look closer.'}</h3><SiteText variant="supporting">{weakest ? 'Your lowest-rated lens is a useful place to investigate. Support the rating with an observation.' : 'Rate each lens and record what you observed. A useful critique ends with something you can test.'}</SiteText>
    <div className="result-note"><SiteHeading level={4} variant="item">Try this test</SiteHeading><SiteText>{weakest ? lenses[weakest.i].test : 'Watch one person attempt the main task without giving instructions. Write down the first place they hesitate.'}</SiteText></div>
    <TextArea label="One change to test next" value={d.next} onChange={next=>set({...d,next})} placeholder="What would you change, and what would improve?" rows={4} width="100%" />
    <Download title="Product critique" body={body} disabled={!d.product.trim() || rated.length < 4} />{(!d.product.trim() || rated.length < 4) && <SiteText variant="supporting">Name the product and rate all four lenses to save.</SiteText>}
    </aside></div><Method>Separate an observation from an interpretation. “Three people missed the button” is evidence; “the layout is confusing” is a hypothesis. These ratings are your assessment, not an automated audit. Use the weakest lens to choose the next test.</Method></>
}
function App() {
  const [active,setActive] = useState<ToolId>(readTool)
  const [decision,setDecision] = useState<Decision>(()=>structuredClone(initialDecision))
  const [experiment,setExperiment] = useState<Experiment>(()=>structuredClone(initialExperiment))
  const [critique,setCritique] = useState<Critique>(()=>structuredClone(initialCritique))
  useEffect(()=>{ const changed=()=>setActive(readTool()); window.addEventListener('hashchange',changed); return ()=>window.removeEventListener('hashchange',changed) },[])
  const tool=tools.find(t=>t.id===active)!
  return <N3wthProvider mode="dark"><a className="skip" href="#workspace">Skip to tool</a>
    <SiteNavigation brand={<a className="brand" href="https://n3wth.com"><img src="/mark.svg" width="24" height="24" alt="" />n3wth<span className="muted">/</span>Lab</a>} links={<><a href="https://n3wth.com">About Oliver</a><a href="https://n3wth.com/contact">Work together</a></>} />
    <SiteContainer as="main" className="n3wth-site-main"><div className="intro"><PageHeader title="A little more clarity." description="Three tools for the decisions, experiments, and products you’re working on." spacing="compact" /><SiteText variant="supporting">By Oliver Newth. Bring a real question.</SiteText></div>
    <nav className="tool-nav" aria-label="Lab tools">{tools.map(t=><a href={`#${t.id}`} key={t.id} aria-current={active===t.id?'page':undefined} className={active===t.id?'selected':''}><span className="tool-number">{t.number}</span><span><strong>{t.name}</strong><span className="tool-description">{t.desc}</span></span></a>)}</nav>
    <SiteSection id="workspace" aria-labelledby="tool-title"><div className="workspace-heading"><div><SiteHeading level={2} variant="section" id="tool-title">{tool.name}</SiteHeading><SiteText variant="supporting">{active==='decide'?'Start with the example or enter your own decision.':active==='experiment'?'Edit the example to design your next experiment.':'Review a real experience through four practical lenses.'}</SiteText></div><span className="muted">{active==='critique'?'Your assessment':'Editable example'}</span></div>
    {active==='decide'?<DecisionTool d={decision} set={setDecision} />:active==='experiment'?<ExperimentTool d={experiment} set={setExperiment} />:<CritiqueTool d={critique} set={setCritique} />}
    <SiteText variant="supporting">Your inputs stay in this tab. Save a result before you close or refresh it.</SiteText></SiteSection>
    </SiteContainer><SiteFooter /></N3wthProvider>
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
