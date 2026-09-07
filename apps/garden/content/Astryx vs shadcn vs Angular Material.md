---
title: "Astryx vs shadcn: which design system for LLM-written UI"
description: "Astryx vs shadcn (and Angular Material): field notes from rebuilding this garden with an LLM writing the UI, and which system makes accessible design easiest."
tags: [technology, engineering, design, development]
date: 2026-07-14
---

# Astryx vs shadcn: which design system for LLM-written UI

**Astryx vs shadcn** is the comparison I keep seeing, including the other way around (shadcn vs Astryx). This garden was rebuilt on [Astryx](https://astryx.atmeta.com/), Meta's open-source design system, almost entirely by an LLM. That makes it a decent field test for a question I haven't seen answered elsewhere: *where should the accessibility contract live when an AI agent writes your UI?* Astryx enforces WCAG compliance at the type level — required props, compile-time errors — while shadcn leaves it at the prompt level, where it drifts with every edit. Notes below against the two I'd otherwise reach for — [shadcn/ui](https://ui.shadcn.com/) and [Angular Material](https://material.angular.dev/).

## Three ownership models

The deepest difference isn't styling — it's *who owns the component source*, because that determines what an LLM can see and safely change.

- **Astryx** ships pre-compiled, typed packages. The agent composes documented APIs and themes via tokens; it can eject a single component (`npx astryx swizzle Button`) when it truly needs to fork one.
- **shadcn/ui** vendors component source *into your repo*. The agent can read and edit every line — maximum flexibility, but every edit is now yours to maintain, including the accessibility behavior.
- **Angular Material** is a classic framework-integrated package: strong components, theming through tokens/Sass, internals firmly closed.

## Feeding the model: docs the agent can actually read

LLMs write better code against APIs they can *query* rather than half-remember from training data:

- **Astryx** is explicitly agent-first: every component's full API, composition hints, and do/don't guidance is available offline via `node node_modules/@astryxdesign/core/docs.mjs <Name>` and the `astryx` CLI, plus an MCP server. During this rebuild, the agent looked up `CommandPalette`, `Outline`, and `Lightbox` docs on demand and used them correctly first try — including components far too new to be in training data.
- **shadcn** has closed the gap fast: it ships a [first-party MCP server](https://ui.shadcn.com/docs/mcp) and, as of the [July 2026 Base UI release](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), "shadcn/skills" that give coding agents component and registry context. And because the source lives in your repo, the code itself is documentation an agent can grep.
- **Angular Material** has excellent human documentation and no first-party agent surface. The model works from training data — usually fine for this mature, stable API, but it shows on newer M3 token theming.

## The accessibility question

Was it easier to ship W3C/WCAG-conformant UI with Astryx? **Yes — and the reason is more interesting than "the components are accessible."** All three systems have accessible primitives (Astryx's components, shadcn's Radix/Base UI underneath, Material's superb [CDK a11y toolkit](https://material.angular.dev/cdk/a11y/overview)). The difference is where the accessibility contract lives:

1. **Astryx enforces accessibility at the type level.** `IconButton` won't compile without a `label`. `SegmentedControl` *requires* an accessible group label. `StatusDot` requires a label because color alone can't carry meaning. This is the killer feature for LLM development: an agent that forgets an aria-label gets an immediate TypeScript error and fixes it in the same loop — no human audit needed. Accessibility failures become build failures.
2. **Astryx's docs put a11y guidance in the agent's context window at the moment of use.** Each component's docs include do/don't rules ("always pair the dot with visible text", "make the last breadcrumb plain text"). When the agent reads the API, it reads the accessibility rules too.
3. **shadcn is accessible until you edit it.** The primitives are battle-tested, but the whole point of shadcn is modifying vendored source — and every modification can silently break focus traps, ARIA wiring, or keyboard handling with no compiler pushback. With an LLM doing rapid iterations, that drift is a real risk; the ecosystem is patching it with context layers like [A11Y.md](https://rogerwong.me/2026/06/a11y-md-accessibility-for-ai-agents), which is a prompt-level fix for what Astryx solves at the type level.
4. **Angular Material's a11y foundation is arguably the strongest** — `FocusTrap`, `LiveAnnouncer`, high-contrast support are first-class CDK citizens. But the contract is conventions in human docs, not required props, and LLMs are measurably weaker at Angular templates than at React/TSX (there's simply less of it in training data). The agent can do the right thing; nothing *makes* it.

## Where each one wins

| | Astryx | shadcn/ui | Angular Material |
|---|---|---|---|
| Agent-readable docs | CLI + MCP + offline docs, first-party | MCP + skills, first-party | None (human docs) |
| A11y enforcement | **Type-level (required props)** | Primitive-level, drifts with edits | Convention-level, strong CDK tools |
| Customization | Tokens + `defineTheme` + swizzle | Unlimited (you own the source) | Tokens/Sass, internals closed |
| Maturity | Beta (0.1.5) — real rough edges | Very mature ecosystem | Most mature of the three |
| Framework | React | React | Angular only |

Honesty requires the beta caveat: Astryx 0.1.5's dist is compiled against `react/jsx-dev-runtime`, which React 19 stubs out in production — this site ships a webpack shim to work around it. shadcn will never have that class of problem, because there's no dist to break.

## Verdict

For LLM-driven development specifically, **Astryx currently has the best architecture**: machine-queryable docs plus compile-time accessibility contracts mean the agent's fast iteration loop *converges on* compliant UI instead of drifting away from it. **shadcn** is the pragmatic pick when you need an ecosystem, unlimited visual control, and don't mind owning the a11y burden your agent's edits create. **Angular Material** remains the right answer inside an Angular shop — but you'll be the accessibility reviewer your compiler isn't.

The general principle I'm taking away: *when an LLM writes your UI, move correctness contracts from documentation into the type system.* Whatever the compiler enforces, the agent gets right.

Related: [[Digital Gardening]], [[Technology Trends]], [[Tools]]

---

*Oliver Newth · July 2026 · [garden.n3wth.com/astryx-vs-shadcn-vs-angular-material](https://garden.n3wth.com/astryx-vs-shadcn-vs-angular-material)*
