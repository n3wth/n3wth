import { Beat } from '../kit/Beat'
import { ToggleCompare } from '../kit/ToggleCompare'

/* The chat box interrupts; an ambient layer doesn't. The toggle below makes
   that literal rather than describing it: same "document" and the same
   pulsing line being rewritten in both states, but the chat-flow state
   dims the work and opens a modal over it, while the ambient-trace state
   leaves the work untouched and only adds a small marker in the margin.
   All motion is CSS keyframes scoped to this file, frozen to a legible
   static frame under prefers-reduced-motion rather than just stopped. */

function InterruptionSpecimen({ ambient }: { ambient: boolean }) {
  return (
    <svg viewBox="0 0 320 170" className="h-44 w-full max-w-md" role="presentation" focusable="false">
      <g className={ambient ? undefined : 'im-doc'}>
        <rect x="16" y="16" width="150" height="6" rx="1" fill="var(--rail)" />
        <rect x="16" y="32" width="130" height="6" rx="1" fill="var(--rail)" />
        <rect x="16" y="48" width="145" height="6" rx="1" className="im-line-pulse" fill="var(--ink-dim)" />
        <rect x="16" y="64" width="110" height="6" rx="1" fill="var(--rail)" />
        <rect x="16" y="80" width="135" height="6" rx="1" fill="var(--rail)" />
      </g>

      <line
        x1="170"
        y1="45"
        x2="170"
        y2="57"
        stroke="var(--ink-faint)"
        strokeWidth={1.5}
        className={ambient ? 'im-caret-ambient' : 'im-caret-chat'}
      />

      {ambient ? (
        <g className="im-marker">
          <path d="M 170 50 C 220 50, 250 49, 292 48" fill="none" stroke="var(--rail-strong)" strokeWidth={1} />
          <circle cx="298" cy="48" r="4" fill="var(--accent)" />
        </g>
      ) : (
        <g className="im-modal-group">
          <rect x="140" y="10" width="165" height="120" fill="none" stroke="var(--rail-strong)" strokeWidth={1} />
          <line x1="150" y1="28" x2="290" y2="28" stroke="var(--rail-strong)" strokeWidth={1} />
          <circle cx="195" cy="112" r="3" fill="var(--ink-dim)" className="im-dot" style={{ animationDelay: '0s' }} />
          <circle cx="210" cy="112" r="3" fill="var(--ink-dim)" className="im-dot" style={{ animationDelay: '0.2s' }} />
          <circle cx="225" cy="112" r="3" fill="var(--ink-dim)" className="im-dot" style={{ animationDelay: '0.4s' }} />
        </g>
      )}

      <style>{`
        @keyframes im-line-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        .im-line-pulse { animation: im-line-pulse 2.4s ease-in-out infinite; }

        @keyframes im-caret-ambient { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
        .im-caret-ambient { animation: im-caret-ambient 1s steps(1) infinite; }

        @keyframes im-caret-chat {
          0%, 10% { opacity: 1; }
          14% { opacity: 0; }
          84% { opacity: 0; }
          88%, 100% { opacity: 1; }
        }
        .im-caret-chat { animation: im-caret-chat 6s ease-in-out infinite; }

        @keyframes im-doc-dim {
          0%, 14% { opacity: 1; }
          20%, 70% { opacity: 0.35; }
          76%, 100% { opacity: 1; }
        }
        .im-doc { animation: im-doc-dim 6s ease-in-out infinite; }

        @keyframes im-modal-cycle {
          0%, 14% { opacity: 0; transform: scale(0.96); }
          20%, 70% { opacity: 1; transform: scale(1); }
          76%, 100% { opacity: 0; transform: scale(0.96); }
        }
        .im-modal-group { transform-box: fill-box; transform-origin: center; animation: im-modal-cycle 6s ease-in-out infinite; }

        @keyframes im-dot-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        .im-dot { animation: im-dot-pulse 1s ease-in-out infinite; }

        @keyframes im-marker-cycle {
          0%, 14% { opacity: 0; }
          20%, 70% { opacity: 1; }
          76%, 100% { opacity: 0; }
        }
        .im-marker { animation: im-marker-cycle 6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .im-line-pulse, .im-caret-ambient, .im-caret-chat, .im-doc, .im-modal-group, .im-dot, .im-marker {
            animation: none !important;
          }
          .im-line-pulse { opacity: 0.85 !important; }
          .im-caret-ambient { opacity: 1 !important; }
          .im-caret-chat { opacity: 0 !important; }
          .im-doc { opacity: 1 !important; }
          .im-modal-group { opacity: 1 !important; transform: none !important; }
          .im-dot { opacity: 1 !important; }
          .im-marker { opacity: 1 !important; }
        }
      `}</style>
    </svg>
  )
}

export default function AmbientAi() {
  return (
    <div>
      <Beat
        prose={
          <>
            The chat box is the wrong mental model. Every time I open one I'm doing two things:
            stopping what I was doing, and deciding what to ask. That pause is where most of the
            value gets lost.
          </>
        }
      />

      <Beat
        prose={
          <>
            The AI agent literature makes a distinction worth taking seriously. An agent isn't a
            model you query; it's a software entity that perceives its environment, decides, and
            acts. Perception is the operative word. Something that perceives doesn't wait to be
            addressed – it reads the room.
          </>
        }
      />

      <Beat
        prose={
          <>
            Most of what ships today ignores this. The default pattern is a sidebar or modal: type
            a prompt, read a response, close the window, resume work. The model is brilliant; the
            interaction pattern is a secretary you have to schedule. You carry the overhead of
            knowing when to consult it and knowing how to ask. For most people in most workflows,
            that overhead is just enough friction to make the habit fail.
          </>
        }
      />

      <Beat
        prose={
          <>
            Ambient presence is the alternative. Not a persistent chatbot floating in the corner,
            but a layer that tracks context across what you're already doing – what tab you're on,
            what file is open, what you wrote ten minutes ago – and acts when it's useful rather
            than when prompted. The agent that notices you've been rewriting the same paragraph
            four times and offers a concrete alternative is more useful than any model you'd think
            to summon at that moment.
          </>
        }
      />

      <Beat
        prose={
          <>
            The toggle in this piece tries to make that concrete. On the left, a chat-box flow: you
            stop, switch context, compose a query, wait. On the right, an ambient trace: the agent
            reads what's in focus, surfaces something specific, stays out of the way when there's
            nothing to say. The two have the same underlying model. The difference is entirely in
            when and whether you're interrupted.
          </>
        }
      >
        <ToggleCompare
          beforeLabel="stops to ask"
          afterLabel="keeps going"
          before={<InterruptionSpecimen ambient={false} />}
          after={<InterruptionSpecimen ambient={true} />}
          caption="same document, same paragraph being rewritten. Left: a modal opens over the work and the cursor leaves. Right: the work stays in view and a marker appears in the margin."
        />
      </Beat>

      <Beat
        prose={
          <>
            <p>
              The summoning pattern persists because it maps to how we used to think about
              software – you invoke a tool, the tool does a thing. Agents that perceive and act
              don't fit that frame. They require trusting that something is watching without being
              intrusive, which is a different kind of UX problem than building a good prompt
              interface.
            </p>
            <p className="mt-4">
              The better versions of this are starting to appear. Not as products that call
              themselves agents while fronting a chat box, but as integrations that stay below the
              surface until they have something worth saying. Building the right ambient layer is
              harder than building another chat UI. It requires deciding what the agent should
              notice, what it shouldn't, and when its threshold for acting is low enough to help
              but high enough to avoid noise. That is actually the product.
            </p>
          </>
        }
      />
    </div>
  )
}
