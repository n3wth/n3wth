export const initialDecision = {
  question: 'What should we build next?',
  options: ['A focused tool', 'A content library', 'A community'],
  criteria: ['User value', 'Speed to learn', 'Ease of delivery', 'Long-term potential'],
  weights: [40, 30, 20, 10],
  scores: [[9, 9, 8, 6], [7, 6, 9, 8], [8, 4, 3, 9]],
}
export type Decision = typeof initialDecision
export function rankDecision(d: Decision) {
  const total = d.weights.reduce((a, b) => a + b, 0)
  return d.options.map((name, i) => ({ name: name.trim() || `Option ${i + 1}`, index: i, score: total ? d.scores[i].reduce((sum, score, j) => sum + score * d.weights[j], 0) / total : 0 })).sort((a, b) => b.score - a.score)
}
export const initialExperiment = {
  audience: 'Independent product builders',
  problem: 'Choosing what to build takes longer than testing the idea.',
  intervention: 'Offer a five-minute decision tool with a downloadable result.',
  behavior: 'Complete a comparison and download their result',
  method: 'Invite 20 builders to try one working prototype. Observe where they hesitate.',
  threshold: 'At least 8 of 20 people finish and save a result',
  duration: '7 days',
  failure: 'Interview five people who stopped and revise the weakest step.',
}
export type Experiment = typeof initialExperiment
export const lenses = [
  { name: 'Clarity', question: 'Can someone explain the value after one glance?', test: 'Show the first screen for five seconds. Ask what it does and who it is for.' },
  { name: 'Friction', question: 'How much work comes before the first useful result?', test: 'Watch a new user attempt the main task without help. Count hesitations and unnecessary steps.' },
  { name: 'Trust', question: 'Does the experience give people a reason to believe it?', test: 'Ask what feels uncertain. Check promises, evidence, permissions, and recovery from mistakes.' },
  { name: 'Payoff', question: 'Is the result useful enough to bring someone back?', test: 'Ask the user to apply the result to a real task, then check what they actually used.' },
]
export const initialCritique = { product: '', ratings: [0, 0, 0, 0], evidence: ['', '', '', ''], next: '' }
export type Critique = typeof initialCritique
