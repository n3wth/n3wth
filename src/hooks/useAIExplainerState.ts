import { useState, useCallback } from 'react'

export interface ChallengeState {
  chosenMetrics: Record<string, number> | null
  isAnimating: boolean
}

export function useAIExplainerState() {
  const [states, setStates] = useState<Record<string, ChallengeState>>({
    'challenge-1': { chosenMetrics: null, isAnimating: false },
    'challenge-2': { chosenMetrics: null, isAnimating: false },
    'challenge-3': { chosenMetrics: null, isAnimating: false }
  })

  const makeChoice = useCallback((challengeId: string, metrics: Record<string, number>) => {
    setStates(prev => ({
      ...prev,
      [challengeId]: { chosenMetrics: metrics, isAnimating: true }
    }))
    setTimeout(() => {
      setStates(prev => ({
        ...prev,
        [challengeId]: { ...prev[challengeId], isAnimating: false }
      }))
    }, 1000)
  }, [])

  const getChallengeState = useCallback((challengeId: string) => {
    return states[challengeId] || { chosenMetrics: null, isAnimating: false }
  }, [states])

  return { makeChoice, getChallengeState, states }
}
