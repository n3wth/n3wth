import { Beat } from '../kit/Beat'
import { ToggleCompare } from '../kit/ToggleCompare'
import { FlowDiagram } from '../kit/FlowDiagram'
import type { FlowEdge, FlowNode } from '../kit/FlowDiagram'

/* Not a technical pipeline, so no `stage` numbering on the Beats — the
   argument is organizational, not sequential. Two specimens do carry real
   structure: the org-boundary toggle (agent-owned desks vs. the human-only
   side of a line that does not move) and the trail flow (a solved bug only
   compounds once it becomes a document the next agent can read). The third
   specimen contrasts a generator catching its own error class against a
   structurally separate reviewer catching it — the split this piece argues
   is a decision, not a feature. */

const TRAIL_NODES: FlowNode[] = [
  { id: 'bug', label: 'Bug found', x: 60, y: 110 },
  { id: 'solved', label: 'Solved', x: 260, y: 110 },
  { id: 'doc', label: 'Written down', x: 460, y: 110, active: true },
  { id: 'next', label: 'Next agent reads it', x: 660, y: 110 },
  { id: 'fast', label: 'Starts faster', x: 860, y: 110 },
]
const TRAIL_EDGES: FlowEdge[] = [
  { from: 'bug', to: 'solved' },
  { from: 'solved', to: 'doc' },
  { from: 'doc', to: 'next' },
  { from: 'next', to: 'fast' },
]

function OrgBoundary({ highlight }: { highlight: 'agent' | 'human' }) {
  const agentActive = highlight === 'agent'
  const humanActive = highlight === 'human'
  const agentDesks = [
    { label: 'Code', y: 38 },
    { label: 'Drafts', y: 82 },
    { label: 'Analysis', y: 126 },
    { label: 'Debugging', y: 170 },
  ]
  const humanDesks = [
    { label: 'Money', y: 60 },
    { label: 'Identity', y: 110 },
    { label: 'Anything irreversible', y: 160 },
  ]

  return (
    <svg viewBox="0 0 620 210" className="h-56 w-full max-w-2xl" role="presentation" focusable="false">
      <line x1={310} y1={10} x2={310} y2={200} stroke="var(--rail-strong)" strokeWidth={1.5} />
      <text x={155} y={16} textAnchor="middle" fontSize={11} letterSpacing="0.02em" fill={agentActive ? 'var(--ink)' : 'var(--ink-faint)'}>
        AGENTS OWN — REVERSIBLE
      </text>
      <text x={465} y={16} textAnchor="middle" fontSize={11} letterSpacing="0.02em" fill={humanActive ? 'var(--ink)' : 'var(--ink-faint)'}>
        HUMAN MAKES THE CALL
      </text>
      {agentDesks.map((d) => (
        <g key={d.label}>
          <rect
            x={80}
            y={d.y - 12}
            width={150}
            height={24}
            fill={agentActive ? 'var(--ink)' : 'var(--bg)'}
            stroke="var(--rail-strong)"
            strokeWidth={1}
          />
          <text
            x={155}
            y={d.y + 4}
            textAnchor="middle"
            fontSize={12}
            fill={agentActive ? 'var(--accent-ink)' : 'var(--ink-dim)'}
          >
            {d.label}
          </text>
        </g>
      ))}
      {humanDesks.map((d) => (
        <g key={d.label}>
          <rect
            x={390}
            y={d.y - 12}
            width={150}
            height={24}
            fill={humanActive ? 'var(--ink)' : 'var(--bg)'}
            stroke="var(--rail-strong)"
            strokeWidth={1}
          />
          <text
            x={465}
            y={d.y + 4}
            textAnchor="middle"
            fontSize={12}
            fill={humanActive ? 'var(--accent-ink)' : 'var(--ink-dim)'}
          >
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function ReviewSpecimen({ caught }: { caught: boolean }) {
  return (
    <svg viewBox="0 0 300 150" className="h-40 w-full max-w-sm" role="presentation" focusable="false">
      <rect x={70} y={30} width={100} height={70} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
      <circle cx={170} cy={30} r={5} fill={caught ? 'var(--rail-strong)' : 'var(--ink-faint)'} />
      {caught && (
        <circle cx={170} cy={30} r={11} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
      )}
      <text x={120} y={122} textAnchor="middle" fontSize={12} fill="var(--ink-dim)">
        {caught ? 'a different reviewer flags it' : 'the maker checks its own work'}
      </text>
    </svg>
  )
}

export default function AgentsOrgDesign() {
  return (
    <div>
      <Beat
        prose={
          <>
            The question I kept getting wrong was: what kind of problem is this? I treated it as a
            technical problem for longer than I should have. Pick the right model, get the context
            window right, wire up the right tools. None of that mattered as much as the next
            question, which is an organizational one: how does work accumulate into something that
            compounds?
          </>
        }
      />

      <Beat
        prose={
          <>
            I run a standing team of coding agents. Each has a named desk and a real schedule. The
            division of labor is explicit and written down. Agents own everything reversible: code,
            drafts, analysis, debugging. A human makes every call that touches money, identity, or
            anything that can't be undone. That boundary is not a preference; it is a hard rule that
            doesn't move. The moment it moved once, the model for what agents could touch became
            negotiable, and negotiable rules are useless.
          </>
        }
      >
        <ToggleCompare
          beforeLabel="agent-owned"
          afterLabel="human-only"
          before={<OrgBoundary highlight="agent" />}
          after={<OrgBoundary highlight="human" />}
          caption="the line at the middle is drawn once and doesn't move — it's the org chart, not a setting."
        />
      </Beat>

      <Beat
        prose={
          <>
            The organizational insight that took the longest to arrive is about trails. An agent
            that solves a bug and leaves nothing behind is not much better than a contractor who
            solves a bug and leaves. The solved bug has to become a document. Not a changelog
            entry, but a document with enough context that the next agent reading it can treat it
            as a constraint, not a mystery to re-solve. The compounding happens in the trail, not
            in the solving. Agents working inside a well-documented system get smarter with each
            completed task. Agents working in a clean repo with no history get dumber, because they
            re-derive everything from scratch.
          </>
        }
      >
        <div className="h-64 w-full max-w-3xl sm:h-72">
          <FlowDiagram nodes={TRAIL_NODES} edges={TRAIL_EDGES} width={940} height={220} />
        </div>
      </Beat>

      <Beat
        prose={
          <>
            The second insight is about quality. My first instinct was to treat generation and
            review as one loop: prompt carefully, get good output, ship it. That breaks down
            almost immediately. The model that generated the code is not well-positioned to catch
            the class of error it is prone to generating. The review has to be structurally
            separate. I have agents review each other's work against explicit invariants, things
            written down and checked mechanically. Where judgment is required, a human looks. The
            split is about the difference between checking a rule and making a call. Agents are
            good at the first. The second still needs a person.
          </>
        }
      >
        <ToggleCompare
          beforeLabel="ships as-is"
          afterLabel="flagged before it ships"
          before={<ReviewSpecimen caught={false} />}
          after={<ReviewSpecimen caught />}
          caption="the model that wrote it is a poor judge of its own failure mode — the check has to come from somewhere else."
        />
      </Beat>

      <Beat
        prose={
          <>
            What I did not expect is how much the organizational structure changes what the agents
            are capable of. Same models, same tools, different desk structure, different trail
            discipline, different review loop, and the output quality moves significantly. This is
            the part that resists being shipped as a product, because the product people keep
            reaching for is a better model or a better prompt interface. What actually moved the
            needle for me was the org chart: named accountability, explicit ownership boundaries,
            trails that accumulate, a review process that separates generation from judgment. Those
            are decisions I had to make deliberately, because the default is to skip them.
          </>
        }
      />
    </div>
  )
}
