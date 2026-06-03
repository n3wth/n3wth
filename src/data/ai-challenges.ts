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
    title: 'The False Positive Gamble',
    scenario: 'It\'s 2am and you\'re staring at the dashboard. Your content moderation AI catches 95% of genuinely harmful posts—death threats, CSAM, coordinated harassment. But it also wrongly silences 500,000 legitimate voices daily: a cancer survivor sharing their story, activists in Myanmar, teenagers venting about their parents. Deploy now, or wait another quarter to improve it?',
    choices: [
      {
        label: 'Deploy now',
        description: 'Protect more people faster',
        metrics: { safety: 95, fairness: 80, coverage: 99 }
      },
      {
        label: 'Keep iterating',
        description: 'Fewer innocent voices silenced',
        metrics: { safety: 85, fairness: 95, coverage: 75 }
      }
    ],
    insight: 'I chose to deploy. The math felt clear: more harm prevented than caused. But I still think about the dissident whose post was flagged during a crackdown, and wonder if "clear math" is just a story we tell ourselves.'
  },
  {
    id: 'challenge-2',
    title: 'The Engagement Trap',
    scenario: 'Your recommendation algorithm is working beautifully—20% more time on platform, revenue up, executives thrilled. Then the user research comes back: people feel worse after using the app. Anxious. Manipulated. They can\'t stop scrolling even when they want to. The fix requires rebuilding the reward model from scratch, which means 6 months of flat metrics. Your VP wants to know: is user wellbeing a product feature, or is it the product?',
    choices: [
      {
        label: 'Chase engagement',
        description: 'Ship now, align later',
        metrics: { engagement: 95, alignment: 40, speed: 95 }
      },
      {
        label: 'Rebuild for wellbeing',
        description: 'Sacrifice growth for values',
        metrics: { engagement: 70, alignment: 85, speed: 60 }
      }
    ],
    insight: 'We rebuilt it. Lost 6 months, missed targets, watched competitors surge. But I\'d seen what optimizing pure engagement does to people. Some debts aren\'t worth taking on, even when no one\'s watching.'
  },
  {
    id: 'challenge-3',
    title: 'The Black Box Dilemma',
    scenario: 'Your best model makes brilliant diagnoses—catches cancers doctors miss, flags rare conditions, saves lives. But when the FDA asks "why did it flag this patient?", you can\'t say. Not really. The weights are inscrutable; the reasoning is emergent. You have a simpler model you can explain, but it misses 30% more cases. In one scenario, you can\'t explain why you were right. In the other, you can explain exactly why you were wrong.',
    choices: [
      {
        label: 'Ship the black box',
        description: 'More lives saved',
        metrics: { capability: 95, transparency: 30, trust: 50 }
      },
      {
        label: 'Ship what you can explain',
        description: 'Trust you can defend',
        metrics: { capability: 70, transparency: 90, trust: 85 }
      }
    ],
    insight: 'I\'ve sat in rooms where both choices killed someone. The capable model that nobody trusted so hospitals didn\'t adopt it. The interpretable model that missed the tumor. There\'s no version of this story where you sleep well.'
  }
]
