export interface ThoughtPiece {
  id: string
  title: string
  description: string
  insights: string[]
  category: 'AI' | 'Creative Tech' | 'Design' | 'Trust'
}

export const thoughtPieces: ThoughtPiece[] = [
  {
    id: 'trust-production',
    title: 'Trust Is a Runtime Property',
    description:
      'Accuracy on a benchmark and trustworthiness in production are different problems. The gap between them is where most AI products fail. I\'ve spent a decade closing that gap at Google, Meta, and Microsoft—and the hardest part is never the model.',
    insights: [
      'Safety classifiers need to run at the latency budget of the features they protect—50ms for chat, 200ms for feed. Async review is a policy failure, not an architecture choice.',
      'The best Trust & Safety systems are feedback loops, not filters. Every false positive is training data for the next iteration. Ship the learning infrastructure before the classifier.',
      'Production trust requires observability that most ML teams never build: drift detection, adversarial input monitoring, and user-facing confidence signals that degrade gracefully.',
    ],
    category: 'Trust',
  },
  {
    id: 'creative-engineering',
    title: 'Why the Best AI Engineers Need a Creative Practice',
    description:
      'Building a 30-foot LED sculpture for Burning Man and shipping a Gemini feature at Google share a surprising amount of process. Both require systems thinking under real constraints, tight iteration loops, and the humility to let the work teach you what it wants to be.',
    insights: [
      'Desert installations fail in ways production systems do—heat, dust, power surges. Designing for the playa taught me more about fault tolerance than any SRE handbook.',
      'Art forces you to work with ambiguity. Most product managers optimize for certainty—the best ones know when to let a problem stay undefined until the right solution surfaces. That skill transfers to early-stage AI product development.',
      'Creative practice rebuilds the muscle for first-principles thinking that years of best-practice templates and OKR frameworks have worn down.',
    ],
    category: 'Creative Tech',
  },
  {
    id: 'research-production-gap',
    title: 'The 1,000x Gap Between Demo and Deployment',
    description:
      'Every AI research demo works. Getting it to work reliably at 100K QPS with 99.9 percent uptime, graceful degradation, and a cost structure that doesn\'t bankrupt the business unit is the actual job. After shipping AI products at four companies, the patterns are clear.',
    insights: [
      'Most research-to-production failures happen at the data layer, not the model layer. Schema drift, missing features at inference time, and training/serving skew kill more products than bad architectures.',
      'At Covariant, I learned that real-world robotics AI needs to handle 10x more edge cases than the research paper considered. The long tail of warehouse environments is where computer vision systems live.',
      'The teams that ship fastest build evaluation infrastructure first. If you can\'t measure regression in fewer than five minutes, you can\'t iterate fast enough to survive the transition from research to product.',
    ],
    category: 'AI',
  },
  {
    id: 'resilient-systems',
    title: 'What Desert Art Taught Me About Resilient Systems',
    description:
      'When your installation needs to survive 60 mph dust storms, 110-degree heat, and 70,000 people who have never read a manual, you learn to design for failure in ways that server-room engineering never teaches you. The playa is the best stress test environment on earth.',
    insights: [
      'Every LED controller in a Burning Man installation runs its own state machine. If the network fails, each node falls back to a standalone pattern. The same principle governs circuit breakers in microservices, but you learn it faster when the alternative is darkness at 2 a.m.',
      'Over-engineering kills art projects the same way it kills startups. The Pink Triangle memorial uses simple, modular LED panels because complexity is the enemy of reliability when your maintenance window is "never" for a week.',
      'The audience doesn\'t care about your architecture—they care about the experience. That lesson holds for 70,000 people in the desert and 750 million people on Instagram. Ship the feeling, not the spec sheet.',
    ],
    category: 'Design',
  },
]

export interface Principle {
  id: string
  title: string
  description: string
}

export const principles: Principle[] = [
  {
    id: 'trust-first',
    title: 'Trust Compounds, Hype Decays',
    description:
      'Every AI product starts with a promise. The ones that last deliver on it consistently, at scale, in production. I optimize for the second year of a product\'s life, not the launch blog post.',
  },
  {
    id: 'craft-matters',
    title: 'Craft Is Not a Luxury',
    description:
      'Whether it\'s a Gemini safety classifier or a 2,700-LED memorial installation, the details are the product. Tolerances, latencies, edge cases—the invisible work is what separates tools people use from tools people trust.',
  },
  {
    id: 'art-and-systems',
    title: 'Art and Systems Are the Same Practice',
    description:
      'Building for the desert and building for billion-user platforms both require the same discipline: Understand the constraints, respect the materials, and design for the people who will experience the work—not the people who will review the architecture.',
  },
  {
    id: 'ship-learning',
    title: 'Ship the Feedback Loop',
    description:
      'The model is never the product. The system that improves the model from real-world usage is the product. The best AI teams build learning infrastructure before they build features.',
  },
]
