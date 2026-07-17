export interface ThoughtPiece {
  id: string
  title: string
  description: string
  insights: string[]
  category: 'AI' | 'Trust'
}

export const thoughtPieces: ThoughtPiece[] = [
  {
    id: 'agents-org-design',
    title: 'Agents Are an Org Design Problem',
    description:
      'I don’t just build products for the agent era — I run on it. My products are engineered, reviewed, and shipped daily by a standing team of autonomous agents with named desks, real schedules, and hard rules about what stays human. The lessons that matter are organizational, not technical.',
    insights: [
      'Agents compound only when work leaves a trail. Every solved bug becomes a doc the next agent inherits, so the team gets faster every week instead of rediscovering the same failure.',
      'The trust boundary is the real design decision: agents own everything reversible — code, drafts, analysis — while a human makes every call that touches money, identity, or anything irreversible.',
      'Quality comes from review, not generation. One agent shipping unreviewed is a demo; agents reviewing each other against explicit invariants, with a human eye on the subjective calls, is an engineering org.',
    ],
    category: 'AI',
  },
  {
    id: 'trust-production',
    title: 'Trust Is a Runtime Property',
    description:
      'Accuracy on a benchmark and trustworthiness in production are different problems. The gap between them is where most AI products fail. I\'ve spent a decade closing that gap at Google, Meta, and Microsoft\u2014and the hardest part is never the model.',
    insights: [
      'Safety classifiers need to run at the latency budget of the features they protect\u201450ms for chat, 200ms for feed. Async review is a policy failure, not an architecture choice.',
      'The best Trust & Safety systems are feedback loops, not filters. Every false positive is training data for the next iteration. Ship the learning infrastructure before the classifier.',
      'Production trust requires observability that most ML teams never build: drift detection, adversarial input monitoring, and user-facing confidence signals that degrade gracefully.',
    ],
    category: 'Trust',
  },
  {
    id: 'ambient-ai',
    title: 'AI Should Be Present, Not Summoned',
    description:
      'The dominant interaction model for AI is a chat box: you summon it, ask a question, dismiss it. But the most useful collaborators don\'t wait to be asked. They\'re present in the work, watching the context evolve, offering input at the right moment. The next generation of AI products will be ambient, not on-demand.',
    insights: [
      'Chat-based AI forces the user to context-switch: stop working, formulate a prompt, parse a response, translate it back to the task. Ambient AI stays in the flow of work and reduces that overhead to zero.',
      'Multi-agent systems where specialized AIs coordinate with each other\u2014and with humans\u2014in shared workspaces will replace the single-assistant model. The coordination protocol matters more than any individual model\'s capability.',
      'Transparency is the price of presence. An AI that\'s always in the room needs to show its reasoning, declare its uncertainty, and make its actions visible. Ambient without transparent is surveillance.',
    ],
    category: 'AI',
  },
]

