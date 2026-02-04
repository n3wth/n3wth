export interface Challenge {
  id: string
  title: string
  scenario: string
  choices: {
    label: string
    description: string
    metrics: Record<string, number>
  }[]
  insight: string
}

export const aiChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Content Moderation at Scale',
    scenario: 'Your content moderation system catches 95% of harmful content but also flags 5% of legitimate speech. Rolling it out means 10 million users see errors daily. Do you deploy or iterate?',
    choices: [
      {
        label: 'Deploy',
        description: 'Broader coverage now',
        metrics: { safety: 95, fairness: 80, coverage: 99 }
      },
      {
        label: 'Iterate',
        description: 'Higher quality first',
        metrics: { safety: 85, fairness: 95, coverage: 75 }
      }
    ],
    insight: 'Content moderation reveals the tension between precision and recall. Deploy fast and iterate, or perfect before launch? Both have costs.'
  },
  {
    id: 'challenge-2',
    title: 'Recommendation Alignment',
    scenario: 'Your recommendation algorithm maximizes engagement (20% more clicks) but users report feeling manipulated. Fixing this requires slowing down the training loop. Do you optimize for engagement or for values alignment?',
    choices: [
      {
        label: 'Optimize for Engagement',
        description: 'Deploy fast, align later',
        metrics: { engagement: 95, alignment: 40, speed: 95 }
      },
      {
        label: 'Align for Values',
        description: 'Careful value incorporation',
        metrics: { engagement: 70, alignment: 85, speed: 60 }
      }
    ],
    insight: 'Alignment takes time. Quick wins create momentum but can lock in misaligned behavior. The tension between speed and careful value incorporation never fully resolves.'
  },
  {
    id: 'challenge-3',
    title: 'Capability vs. Transparency',
    scenario: 'Your most capable AI model uses techniques you can\'t fully explain to regulators. A simpler, more interpretable model is available but 30% less capable. Which do you ship at scale?',
    choices: [
      {
        label: 'Ship Capable',
        description: 'Better performance',
        metrics: { capability: 95, transparency: 30, trust: 50 }
      },
      {
        label: 'Ship Interpretable',
        description: 'Better trust',
        metrics: { capability: 70, transparency: 90, trust: 85 }
      }
    ],
    insight: 'Transparency and capability often trade off. Users might trust simpler systems more, but they solve fewer problems. Building trust in powerful systems is one of the hardest problems in AI.'
  }
]
