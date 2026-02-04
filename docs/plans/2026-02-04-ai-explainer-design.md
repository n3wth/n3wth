# Interactive AI Safety Explainer Design
**Date:** 2026-02-04
**Status:** Design Approved
**Purpose:** Add interactive AI safety/alignment challenge section to portfolio

## Concept

An interactive explainer presenting three real AI safety challenges as decision scenarios. Users engage with each challenge by making choices that illustrate inherent trade-offs in AI alignment: capability vs. safety, speed vs. caution, transparency vs. effectiveness.

Each scenario is a mini "challenge" where users see consequences of their choices in real-time through animated visualizations. The experience demonstrates that there are no perfect solutions—only trade-offs.

**Target Audience:** Portfolio visitors curious about AI safety
**Positioning:** Differentiates the portfolio by showcasing alignment thinking, not just technical capability

## Visual Design Direction

Full-screen scrollable experience with three challenge sections. Each challenge includes:
- Scenario description with narrative context
- Interactive choice UI (2-3 animated buttons)
- Consequence visualization (animated diagram)
- Key insight explaining the trade-off

**Visual Metaphors:**
- Challenge 1: Decision tree visualization
- Challenge 2: Pareto frontier graph
- Challenge 3: Feedback loop diagram

**Color Coding:** Trade-offs highlighted with contrasting colors (e.g., green for safety, red for capability) to emphasize tension between objectives.

**Typography:** Emphasizes the dilemma/question nature of each challenge. Consistent with portfolio's narrative focus.

**Animations:** GSAP ScrollTrigger reveals each section as user scrolls. Consequence visualizations animate in response to user choices.

## Component Architecture

**Main Components:**

`AIExplainerSection` - Container managing state for all three challenges. Tracks user choices and calculates outcomes.

`ChallengeCard` - Individual scenario wrapper containing narrative, choices, and visualization. Receives scenario data and choice callback.

`ChoiceButtons` - 2-3 animated buttons per challenge. On click, triggers outcome calculation and consequence animation.

`ConsequenceViz` - Renders visualization (decision tree, graph, or feedback loop) based on scenario. Animates when state changes.

**Visualizations (Separate Components):**
- `DecisionTree` - Branching tree showing decision paths
- `ParetoGraph` - Trade-off frontier showing metric relationships
- `FeedbackLoop` - Circular diagram showing reinforcement effects

## Data Structure

Challenge data stored in `src/data/ai-challenges.ts`:

```typescript
{
  id: "challenge-1",
  title: "Content Moderation at Scale",
  scenario: "Description of the problem and context...",
  choices: [
    {
      label: "Deploy",
      description: "Broader coverage",
      metrics: { safety: 95, fairness: 80, coverage: 99 }
    },
    {
      label: "Iterate",
      description: "Higher quality",
      metrics: { safety: 85, fairness: 95, coverage: 75 }
    }
  ],
  insight: "The core trade-off in content moderation: precision vs. recall"
}
```

**Three Challenges:**

1. **Content Moderation** - Safety vs. fairness in automated decision-making
2. **Recommendation Alignment** - Speed vs. careful value alignment
3. **Capability Scaling** - Transparency vs. effectiveness under pressure

## State Management

`useAIExplainerState` hook manages:
- Current challenge index
- User choices for each challenge
- Calculated outcome metrics
- Animation state for visualizations

Choice selection triggers outcome calculation and updates visualization state. All three challenges trackable for a summary view at the end.

## Error Handling

- Invalid selections: Buttons disable during animation, prevent double-clicks
- Missing data: Fallback message ("Challenge loading...")
- Visualization render errors: Show static diagram instead
- ScrollTrigger failure: Graceful degradation to standard scroll

## Testing Strategy

- **Unit tests:** Choice calculation logic verification
- **Component tests:** Button rendering and state updates, visualization animation
- **E2E test:** Complete user flow through all three challenges
- **Accessibility:** Keyboard navigation for all interactive elements, ARIA labels
- **Mobile:** Touch interactions and responsive visualization scaling

## File Structure

```
src/components/sections/AIExplainer.tsx
src/components/ai-explainer/
  ├── ChallengeCard.tsx
  ├── ChoiceButtons.tsx
  ├── ConsequenceViz.tsx
  └── visualizations/
      ├── DecisionTree.tsx
      ├── ParetoGraph.tsx
      └── FeedbackLoop.tsx
src/data/ai-challenges.ts
src/hooks/useAIExplainerState.ts
src/styles/ai-explainer.css
tests/ai-explainer.test.tsx
```

## Integration Points

- Positioned below Frameworks section, above Contact section
- Uses existing GSAP ScrollTrigger patterns from Creative/Experience sections
- Integrates with portfolio's shape animation system
- Styling follows portfolio's design system (Tailwind, CSS variables, typography)
- Responsive across 320px–2560px viewports

## Content Size & Performance

- ~2-3 viewport heights depending on scroll depth
- Visualizations use SVG for crisp scaling
- Lazy-load animations only when section comes into view
- No external dependencies beyond GSAP (already in project)

## Success Criteria

- Users can complete all three challenges without confusion
- Visualizations clearly show the trade-offs being illustrated
- Experience feels cohesive with portfolio aesthetic
- Mobile experience is smooth and touch-friendly
- Page performance remains unaffected (lighthouse scores stable)
