# AI Safety Explainer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive AI safety challenge section with three decision scenarios and animated consequence visualizations.

**Architecture:** Data-driven component system with state management hook. Three challenges flow through state machine: idle → user chooses → calculate outcomes → animate visualization. GSAP ScrollTrigger reveals section on scroll. SVG visualizations for decision tree, Pareto graph, and feedback loop.

**Tech Stack:** React 18, TypeScript, GSAP (ScrollTrigger), Tailwind CSS, SVG graphics

---

## Task 1: Create Challenge Data Structure

**Files:**
- Create: `src/data/ai-challenges.ts`

**Step 1: Write challenge data file**

```typescript
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
```

**Step 2: Verify file created**

Run: `cat src/data/ai-challenges.ts | head -5`
Expected: File shows with interface and first challenge

**Step 3: Commit**

```bash
git add src/data/ai-challenges.ts
git commit -m "feat: add AI challenge data structure"
```

---

## Task 2: Create State Management Hook

**Files:**
- Create: `src/hooks/useAIExplainerState.ts`

**Step 1: Write state hook**

```typescript
import { useState, useCallback } from 'react'
import { Challenge } from '../data/ai-challenges'

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
    // End animation after 1s
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
```

**Step 2: Verify hook**

Run: `cat src/hooks/useAIExplainerState.ts | grep "export function"`
Expected: Shows "export function useAIExplainerState"

**Step 3: Commit**

```bash
git add src/hooks/useAIExplainerState.ts
git commit -m "feat: add AI explainer state management hook"
```

---

## Task 3: Create ChoiceButtons Component

**Files:**
- Create: `src/components/ai-explainer/ChoiceButtons.tsx`

**Step 1: Write component**

```typescript
import { memo } from 'react'

interface Choice {
  label: string
  description: string
  metrics: Record<string, number>
}

interface ChoiceButtonsProps {
  choices: Choice[]
  onChoice: (metrics: Record<string, number>) => void
  isAnimating: boolean
}

export const ChoiceButtons = memo(function ChoiceButtons({
  choices,
  onChoice,
  isAnimating
}: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {choices.map((choice, idx) => (
        <button
          key={idx}
          onClick={() => onChoice(choice.metrics)}
          disabled={isAnimating}
          className="group relative px-6 py-4 sm:px-8 sm:py-5 text-left transition-all duration-300 disabled:opacity-50"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px'
          }}
        >
          <div className="font-display text-base sm:text-lg font-semibold text-white mb-1">
            {choice.label}
          </div>
          <div className="text-sm text-grey-400">
            {choice.description}
          </div>
        </button>
      ))}
    </div>
  )
})
```

**Step 2: Verify component**

Run: `cat src/components/ai-explainer/ChoiceButtons.tsx | grep "export const"`
Expected: Shows ChoiceButtons export

**Step 3: Commit**

```bash
git add src/components/ai-explainer/ChoiceButtons.tsx
git commit -m "feat: add choice buttons component"
```

---

## Task 4: Create Visualization Components

**Files:**
- Create: `src/components/ai-explainer/visualizations/DecisionTree.tsx`
- Create: `src/components/ai-explainer/visualizations/ParetoGraph.tsx`
- Create: `src/components/ai-explainer/visualizations/FeedbackLoop.tsx`

**Step 1: Write DecisionTree**

```typescript
import { memo } from 'react'

interface DecisionTreeProps {
  metrics: Record<string, number> | null
}

export const DecisionTree = memo(function DecisionTree({ metrics }: DecisionTreeProps) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ maxHeight: '300px' }}>
      {/* Root node */}
      <circle cx="200" cy="40" r="30" fill="currentColor" opacity="0.8" />
      <text x="200" y="50" textAnchor="middle" className="text-xs fill-white font-bold">
        Decision
      </text>

      {/* Left branch */}
      <line x1="170" y1="65" x2="100" y2="120" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <circle cx="100" cy="150" r="25" fill="var(--color-green-500)" opacity={metrics ? 0.9 : 0.3} />
      <text x="100" y="155" textAnchor="middle" className="text-xs fill-white font-bold">
        {metrics ? `${Math.round(metrics.safety || 0)}%` : '?'}
      </text>

      {/* Right branch */}
      <line x1="230" y1="65" x2="300" y2="120" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <circle cx="300" cy="150" r="25" fill="var(--color-red-500)" opacity={metrics ? 0.9 : 0.3} />
      <text x="300" y="155" textAnchor="middle" className="text-xs fill-white font-bold">
        {metrics ? `${Math.round(metrics.fairness || 0)}%` : '?'}
      </text>

      {/* Labels */}
      <text x="120" y="110" className="text-xs fill-grey-400">Deploy</text>
      <text x="270" y="110" className="text-xs fill-grey-400">Iterate</text>
    </svg>
  )
})
```

**Step 2: Write ParetoGraph**

```typescript
import { memo } from 'react'

interface ParetoGraphProps {
  metrics: Record<string, number> | null
}

export const ParetoGraph = memo(function ParetoGraph({ metrics }: ParetoGraphProps) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ maxHeight: '300px' }}>
      {/* Axes */}
      <line x1="50" y1="250" x2="350" y2="250" stroke="var(--color-grey-600)" strokeWidth="2" />
      <line x1="50" y1="250" x2="50" y2="50" stroke="var(--color-grey-600)" strokeWidth="2" />

      {/* Grid lines */}
      <line x1="50" y1="150" x2="350" y2="150" stroke="var(--color-grey-700)" strokeWidth="1" opacity="0.3" />
      <line x1="200" y1="250" x2="200" y2="50" stroke="var(--color-grey-700)" strokeWidth="1" opacity="0.3" />

      {/* Labels */}
      <text x="300" y="270" className="text-xs fill-grey-400">Engagement</text>
      <text x="20" y="100" className="text-xs fill-grey-400">Alignment</text>

      {/* Data point */}
      <circle
        cx={metrics ? 50 + (metrics.engagement || 0) * 3 : 200}
        cy={metrics ? 250 - (metrics.alignment || 0) * 2 : 150}
        r="8"
        fill="var(--color-blue-500)"
        opacity={metrics ? 0.9 : 0.3}
      />

      {/* Frontier curve */}
      <path
        d="M 80 220 Q 150 120 320 80"
        stroke="var(--color-grey-500)"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        strokeDasharray="5,5"
      />
    </svg>
  )
})
```

**Step 3: Write FeedbackLoop**

```typescript
import { memo } from 'react'

interface FeedbackLoopProps {
  metrics: Record<string, number> | null
}

export const FeedbackLoop = memo(function FeedbackLoop({ metrics }: FeedbackLoopProps) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ maxHeight: '300px' }}>
      {/* Central circles */}
      <circle cx="200" cy="150" r="80" fill="none" stroke="var(--color-grey-600)" strokeWidth="2" opacity="0.3" />
      <circle cx="200" cy="150" r="50" fill="none" stroke="var(--color-grey-600)" strokeWidth="2" opacity="0.3" />

      {/* Feedback nodes */}
      <circle cx="200" cy="80" r="20" fill="var(--color-blue-500)" opacity={metrics ? 0.8 : 0.4} />
      <text x="200" y="85" textAnchor="middle" className="text-xs fill-white font-bold">AI</text>

      <circle cx="280" cy="150" r="20" fill="var(--color-green-500)" opacity={metrics ? 0.8 : 0.4} />
      <text x="280" y="155" textAnchor="middle" className="text-xs fill-white font-bold">User</text>

      <circle cx="200" cy="220" r="20" fill="var(--color-yellow-500)" opacity={metrics ? 0.8 : 0.4} />
      <text x="200" y="225" textAnchor="middle" className="text-xs fill-white font-bold">Data</text>

      <circle cx="120" cy="150" r="20" fill="var(--color-red-500)" opacity={metrics ? 0.8 : 0.4} />
      <text x="120" y="155" textAnchor="middle" className="text-xs fill-white font-bold">Goal</text>

      {/* Arrows */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="var(--color-grey-500)" />
        </marker>
      </defs>

      <path d="M 210 100 L 260 130" stroke="var(--color-grey-500)" strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.6" />
      <path d="M 260 170 L 210 200" stroke="var(--color-grey-500)" strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.6" />
      <path d="M 190 200 L 140 170" stroke="var(--color-grey-500)" strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.6" />
      <path d="M 140 130 L 190 100" stroke="var(--color-grey-500)" strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.6" />
    </svg>
  )
})
```

**Step 4: Verify visualizations created**

Run: `ls -la src/components/ai-explainer/visualizations/`
Expected: Three files created

**Step 5: Commit**

```bash
git add src/components/ai-explainer/visualizations/
git commit -m "feat: add visualization components"
```

---

## Task 5: Create ConsequenceViz Component

**Files:**
- Create: `src/components/ai-explainer/ConsequenceViz.tsx`

**Step 1: Write component**

```typescript
import { memo, useMemo } from 'react'
import { DecisionTree } from './visualizations/DecisionTree'
import { ParetoGraph } from './visualizations/ParetoGraph'
import { FeedbackLoop } from './visualizations/FeedbackLoop'

interface ConsequenceVizProps {
  challengeId: string
  metrics: Record<string, number> | null
  isAnimating: boolean
}

export const ConsequenceViz = memo(function ConsequenceViz({
  challengeId,
  metrics,
  isAnimating
}: ConsequenceVizProps) {
  const vizComponent = useMemo(() => {
    switch (challengeId) {
      case 'challenge-1':
        return <DecisionTree metrics={metrics} />
      case 'challenge-2':
        return <ParetoGraph metrics={metrics} />
      case 'challenge-3':
        return <FeedbackLoop metrics={metrics} />
      default:
        return null
    }
  }, [challengeId, metrics])

  return (
    <div
      className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl transition-all duration-500"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        opacity: isAnimating ? 1 : 0.7
      }}
    >
      <div className="text-grey-400 mb-4 text-sm">Consequences</div>
      {vizComponent}
    </div>
  )
})
```

**Step 2: Verify component**

Run: `cat src/components/ai-explainer/ConsequenceViz.tsx | grep "export const"`
Expected: Shows ConsequenceViz export

**Step 3: Commit**

```bash
git add src/components/ai-explainer/ConsequenceViz.tsx
git commit -m "feat: add consequence visualization component"
```

---

## Task 6: Create ChallengeCard Component

**Files:**
- Create: `src/components/ai-explainer/ChallengeCard.tsx`

**Step 1: Write component**

```typescript
import { memo } from 'react'
import { Challenge } from '../../data/ai-challenges'
import { ChoiceButtons } from './ChoiceButtons'
import { ConsequenceViz } from './ConsequenceViz'

interface ChallengeCardProps {
  challenge: Challenge
  onChoice: (metrics: Record<string, number>) => void
  isAnimating: boolean
  chosenMetrics: Record<string, number> | null
}

export const ChallengeCard = memo(function ChallengeCard({
  challenge,
  onChoice,
  isAnimating,
  chosenMetrics
}: ChallengeCardProps) {
  return (
    <article className="min-h-screen flex items-center py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-12 w-full">
        <div className="mb-8 sm:mb-10">
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-4">
            {challenge.title}
          </h3>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--color-grey-300)' }}>
            {challenge.scenario}
          </p>
        </div>

        <div className="mb-8 sm:mb-12">
          <div className="text-grey-400 text-sm mb-4">Choose a path</div>
          <ChoiceButtons
            choices={challenge.choices}
            onChoice={onChoice}
            isAnimating={isAnimating}
          />
        </div>

        {chosenMetrics && (
          <>
            <ConsequenceViz
              challengeId={challenge.id}
              metrics={chosenMetrics}
              isAnimating={isAnimating}
            />

            <div className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="text-grey-400 text-sm mb-2">Key Insight</div>
              <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-grey-200)' }}>
                {challenge.insight}
              </p>
            </div>
          </>
        )}
      </div>
    </article>
  )
})
```

**Step 2: Verify component**

Run: `cat src/components/ai-explainer/ChallengeCard.tsx | grep "export const"`
Expected: Shows ChallengeCard export

**Step 3: Commit**

```bash
git add src/components/ai-explainer/ChallengeCard.tsx
git commit -m "feat: add challenge card component"
```

---

## Task 7: Create AIExplainerSection Component

**Files:**
- Create: `src/components/sections/AIExplainer.tsx`

**Step 1: Write section component**

```typescript
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { aiChallenges } from '../../data/ai-challenges'
import { useAIExplainerState } from '../../hooks/useAIExplainerState'
import { ChallengeCard } from '../ai-explainer/ChallengeCard'

gsap.registerPlugin(ScrollTrigger)

export function AIExplainer() {
  const sectionRef = useRef<HTMLElement>(null)
  const { makeChoice, getChallengeState } = useAIExplainerState()

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Header animation
      gsap.from('[data-ai-header]', {
        scrollTrigger: {
          trigger: '[data-ai-header]',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      })

      // Challenge cards stagger in
      gsap.from('[data-challenge-card]', {
        scrollTrigger: {
          trigger: '[data-challenges]',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      })
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="ai-explainer" className="section relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div data-ai-header className="mb-16 sm:mb-20 md:mb-24">
          <p className="label mb-3 sm:mb-4">How we think about alignment</p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 text-glow">
            AI safety has no perfect solutions
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Only trade-offs. Explore three real alignment challenges and see why every decision involves choosing what matters most.
          </p>
        </div>

        {/* Challenges */}
        <div data-challenges>
          {aiChallenges.map((challenge) => {
            const state = getChallengeState(challenge.id)
            return (
              <div key={challenge.id} data-challenge-card>
                <ChallengeCard
                  challenge={challenge}
                  onChoice={(metrics) => makeChoice(challenge.id, metrics)}
                  isAnimating={state.isAnimating}
                  chosenMetrics={state.chosenMetrics}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Verify section**

Run: `cat src/components/sections/AIExplainer.tsx | grep "export function"`
Expected: Shows AIExplainer export

**Step 3: Commit**

```bash
git add src/components/sections/AIExplainer.tsx
git commit -m "feat: add AI explainer section component"
```

---

## Task 8: Integrate AIExplainer into App

**Files:**
- Modify: `src/App.tsx`

**Step 1: Read current App.tsx**

Run: `cat src/App.tsx`
Expected: Shows current structure

**Step 2: Add lazy import**

Add after line 12 (after other lazy imports):

```typescript
const AIExplainer = lazy(() => import('./components/sections/AIExplainer').then(m => ({ default: m.AIExplainer })))
```

**Step 3: Add to JSX**

Add in the Suspense chain (between Frameworks and Creative):

```typescript
<Suspense fallback={<SectionFallback />}>
  <AIExplainer />
</Suspense>
```

**Step 4: Update navigation**

In `src/data/content.ts`, add to navigation array:

```typescript
{ name: 'Alignment', href: '#ai-explainer' },
```

**Step 5: Build and verify**

Run: `npm run build 2>&1 | grep -E "(error|warning|✓ built)"`
Expected: "✓ built in Xs" with no errors

**Step 6: Commit**

```bash
git add src/App.tsx src/data/content.ts
git commit -m "feat: integrate AI explainer into app layout"
```

---

## Task 9: Add Styling

**Files:**
- Create: `src/styles/ai-explainer.css`

**Step 1: Write stylesheet**

```css
/* AI Explainer specific styles */

[data-ai-header] {
  animation: fade-up 0.8s ease-out forwards;
  animation-play-state: paused;
}

[data-challenge-card] {
  animation: fade-up 0.8s ease-out forwards;
  animation-play-state: paused;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* SVG visualization colors */
.ai-viz {
  color: var(--color-white);
}

.ai-viz-safe {
  color: var(--color-green-500);
}

.ai-viz-risk {
  color: var(--color-red-500);
}

/* Responsive visualization sizing */
@media (max-width: 640px) {
  [data-consequence-viz] {
    max-height: 250px;
  }
}

@media (min-width: 641px) {
  [data-consequence-viz] {
    max-height: 350px;
  }
}
```

**Step 2: Import stylesheet in main.tsx**

Add after existing CSS imports in `src/main.tsx`:

```typescript
import './styles/ai-explainer.css'
```

**Step 3: Verify import**

Run: `grep "ai-explainer.css" src/main.tsx`
Expected: Shows import

**Step 4: Build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/styles/ai-explainer.css src/main.tsx
git commit -m "style: add AI explainer styling"
```

---

## Task 10: Add Unit Tests

**Files:**
- Create: `tests/ai-explainer.test.tsx`

**Step 1: Write tests**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AIExplainer } from '../src/components/sections/AIExplainer'
import { ChoiceButtons } from '../src/components/ai-explainer/ChoiceButtons'
import { ChallengeCard } from '../src/components/ai-explainer/ChallengeCard'
import { aiChallenges } from '../src/data/ai-challenges'

describe('AI Explainer Components', () => {
  it('renders AIExplainer section', () => {
    render(<AIExplainer />)
    expect(screen.getByText('AI safety has no perfect solutions')).toBeInTheDocument()
  })

  it('renders all three challenges', () => {
    render(<AIExplainer />)
    aiChallenges.forEach(challenge => {
      expect(screen.getByText(challenge.title)).toBeInTheDocument()
    })
  })

  it('ChallengeCard renders scenario text', () => {
    const challenge = aiChallenges[0]
    render(
      <ChallengeCard
        challenge={challenge}
        onChoice={() => {}}
        isAnimating={false}
        chosenMetrics={null}
      />
    )
    expect(screen.getByText(challenge.scenario)).toBeInTheDocument()
  })

  it('ChoiceButtons calls onChoice when clicked', () => {
    const onChoice = vi.fn()
    const choices = aiChallenges[0].choices
    render(
      <ChoiceButtons
        choices={choices}
        onChoice={onChoice}
        isAnimating={false}
      />
    )
    fireEvent.click(screen.getByText('Deploy'))
    expect(onChoice).toHaveBeenCalledWith(choices[0].metrics)
  })

  it('ChoiceButtons disables when animating', () => {
    const choices = aiChallenges[0].choices
    render(
      <ChoiceButtons
        choices={choices}
        onChoice={() => {}}
        isAnimating={true}
      />
    )
    const buttons = screen.getAllByRole('button')
    buttons.forEach(btn => expect(btn).toBeDisabled())
  })

  it('displays chosen metrics when selected', () => {
    const challenge = aiChallenges[0]
    const metrics = challenge.choices[0].metrics
    render(
      <ChallengeCard
        challenge={challenge}
        onChoice={() => {}}
        isAnimating={false}
        chosenMetrics={metrics}
      />
    )
    expect(screen.getByText('Key Insight')).toBeInTheDocument()
  })
})
```

**Step 2: Run tests**

Run: `npm run test -- tests/ai-explainer.test.tsx 2>&1 | grep -E "(PASS|FAIL|✓|✕)"`
Expected: All tests passing

**Step 3: Commit**

```bash
git add tests/ai-explainer.test.tsx
git commit -m "test: add AI explainer component tests"
```

---

## Task 11: Mobile Responsiveness & Final Build

**Files:**
- Verify responsive behavior across breakpoints

**Step 1: Build for production**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds with no errors

**Step 2: Run ESLint**

Run: `npm run lint 2>&1 | grep -E "(error|warning|✓)"` or just `npm run lint 2>&1`
Expected: No lint errors

**Step 3: Verify all components created**

Run: `find src/components/ai-explainer -type f -name "*.tsx" | wc -l`
Expected: 5 files (ChallengeCard, ChoiceButtons, ConsequenceViz, and 3 visualizations)

**Step 4: Test in browser**

Run: `npm run dev` (in separate terminal)
Navigate to http://localhost:5173
Expected: Section appears below Frameworks, all three challenges render, clicking choices updates visualization

**Step 5: Final commit**

```bash
git log --oneline | head -10
```

Expected: Shows all 10+ commits from this implementation

---

## Verification Checklist

- [ ] All component files created
- [ ] Data structure properly typed
- [ ] State hook manages challenge state
- [ ] GSAP animations working (scroll reveals)
- [ ] Visualizations render (tree, graph, loop)
- [ ] Choice buttons interactive and disable during animation
- [ ] Consequence metrics display after choice
- [ ] Key insights show after choice
- [ ] Responsive on mobile (320px+)
- [ ] All tests passing
- [ ] No lint errors
- [ ] Build succeeds
- [ ] Navigation link added
- [ ] Positioned correctly (below Frameworks, above Contact)

---

## Next Steps

1. Implement all 11 tasks in sequence
2. Test on mobile devices and various screen sizes
3. Verify animations feel smooth (60fps target)
4. Get user feedback on challenge scenarios and trade-off clarity
5. Iterate on visualization design if needed
