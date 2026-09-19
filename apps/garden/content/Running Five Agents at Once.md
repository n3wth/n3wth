---
title: Running Five Agents at Once
description: What it takes to keep Claude Code, Devin, Hermes, Gemini CLI, and gbrain coherent without duplicated memory or contradictory state
tags: [agents, ai-tools, knowledge-management, automation]
---

# Running Five Agents at Once

I run five separate agent estates day to day: Claude Code for interactive work, Devin for autonomous coding sessions, Hermes as my always-on background agent, Gemini CLI for cheap high-volume tasks, and gbrain underneath all of them as the memory layer. Each one is good at something the others aren't. The hard part was never picking a favorite. It was stopping them from stepping on each other.

Three problems showed up immediately once I had more than two agents running: tools got registered twice, memory got written twice, and the interfaces they generated all had the same synthetic sheen. Here's what actually fixed each one.

## One fact, one home

The first failure mode is a fact existing in two places at once. Hermes has built-in memory (`MEMORY.md`, `USER.md`) that loads into every system prompt. gbrain holds the durable, structured knowledge base. Early on I let both accumulate the same kind of information, and they drifted — Hermes would say one thing about a project, gbrain another, and neither agent knew which to trust.

The fix was a strict rule: if a fact can live in both places, gbrain is canonical and Hermes's built-in memory holds only a compact pointer to it. That single rule ends most of the drift. It also forced a five-tier split for what goes where:

- Always-needed identity and preferences → Hermes built-in memory (hard-capped, so it stays a pointer cache, not a knowledge base)
- Durable facts, projects, relationships → gbrain
- Reusable procedures and runbooks → skills (`SKILL.md`), not memory
- Past conversations → full-text session search, not re-summarized into memory
- Scratch work → the current session only, gone when it ends

The skills-versus-memory split matters more than it sounds. A command sequence you use every week is a procedure, not a fact, and it shouldn't be copied into a memory file that gets loaded on every single turn regardless of whether you need it that turn.

## Tools live in exactly one tier

The second failure mode is a tool being reachable two different ways. I split tooling into three tiers: native connectors for anything high-frequency or strictly typed (home automation, Cloudflare, local stdio tools), a private aggregation portal for stable internal MCP servers shared across agents, and an external metered catalog (Treg) for one-off API access where I don't hold direct keys.

The rule that keeps this from collapsing back into chaos: never register the same vendor's tool natively and through a proxy at the same time. Duplicate registration doesn't just waste context — it creates ambiguous routing, and in the worst case, double-billing against a metered API. And don't nest one aggregation layer inside another; both Treg and the internal portal already do tool discovery, so stacking them just adds a hop with no benefit.

[MCP itself has become the de facto standard for this kind of tool wiring](https://addyosmani.com/blog/code-agent-orchestra/) across the agent ecosystem generally, which is part of why the layering problem is common rather than specific to my setup — every agent speaking MCP can in principle reach every tool, and without explicit tiering they will.

## Routing invariants, not routing intuition

Auditing a year of Hermes session logs surfaced something I didn't expect: the single biggest failure category wasn't bad reasoning, it was tool dispatch confusion. Deferred tool calls — the pattern where a model has to explicitly load a tool's schema before using it — failed at a shockingly high rate, because models kept trying to defer tools that were already active in their loaded toolset. Shell timeouts and background-execution syntax errors were the next largest bucket.

None of that is fixable by writing a better prompt and hoping. It's fixable by writing it down as an invariant and enforcing it in the harness: never pass an already-active tool to a deferred-tool-loading call, verify required parameters before calling a tool at all, and rewrite shell backgrounding flags into structured parameters instead of trusting the model to remember `&` doesn't work the way it thinks it does. Autonomous execution across multiple agents only holds up if these rules live in the plumbing, not in agent judgment that has to be freshly correct every single turn.

## Match the model to the loop, not the other way around

Not every agent needs a frontier model. Hermes's main loop — the one doing tool calling, multi-step reasoning, and skill dispatch — needs a model with strong instruction-following discipline, because it's carrying a lot of system-prompt scaffolding on every turn. Delegated subtasks (bulk coding, cheap routing, trivial classification) don't need that; they need throughput. Running everything on one model tier is either wasteful or under-powered depending on which way you get it wrong. The fix was tiering explicitly: a capable model for the primary loop, a cheaper model for delegation, and an even cheaper one for trivial routing — configured once, not decided per task.

## Interface restraint: the anti-slop pass

The last recurring problem wasn't about coordination, it was about output quality once multiple agents started generating UI and docs on my behalf. Agent-generated interfaces converge on the same tells: monospace fonts applied to things that aren't code, invented jargon in section headers, decorative numbering on lists with no real sequence, and horizontal dividers used as a substitute for actual layout structure.

I ended up writing these down as hard negative constraints rather than re-explaining them every session: monospace only for literal code, file paths, and commands; category labels are plain concrete nouns, not manufactured jargon; no arbitrary `01 02 03` prefixes; no decorative dividers where spacing and alignment can do the job instead. It's a small list, but it's the difference between an agent-built interface looking considered and looking generated.

## What actually holds it together

None of these are exotic techniques. They're closer to bookkeeping: one canonical location per fact, one tier per tool, explicit invariants instead of hoping the model infers them, model choice matched to what the loop actually demands, and a written style floor so five different agents don't produce five different aesthetics. The work of running multiple agents well is mostly the work of taking coordination problems that used to be implicit — because there was only one agent, so there was nothing to coordinate — and making them explicit before you add the second, third, fourth, and fifth.

The instinct to reach for a bigger, single, do-everything agent is understandable, but in practice the specialization is worth the coordination overhead, as long as the overhead is paid once, in architecture, rather than every session in prompt text.

[[Knowledge Management Systems]] covers the broader framework this memory hierarchy sits inside. [[How OpenClaw Dreaming Works]] is a related approach to the same underlying problem — consolidating short-term agent memory into durable long-term memory on a schedule, rather than letting everything pile up unfiltered.
