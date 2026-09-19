---
title: Productive Laziness in Engineering
description: Why minimal, lazy-by-design code beats speculative building — YAGNI, worse-is-better, and the three virtues of a programmer
tags:
  - software-engineering
  - yagni
  - simplicity
---

# Productive Laziness in Engineering

The best engineers are lazy on purpose. Not lazy about understanding a problem — lazy about how much code they let it cost.

## YAGNI: don't build it until it's needed

YAGNI ("You Aren't Gonna Need It") comes from Extreme Programming. [Martin Fowler's canonical writeup](https://martinfowler.com/bliki/Yagni.html) breaks the cost of a speculative feature into four parts:

- **Cost of build** — time spent on a feature you end up not needing at all.
- **Cost of delay** — the feature you actually needed shipped later because you built the wrong one first.
- **Cost of carry** — the unused feature still sits in the codebase, adding complexity every other change has to route around.
- **Cost of repair** — if your guess about the future was wrong (usually), you pay to rip it out.

Kent Beck's 2026 reframing sharpens the point: YAGNI was never really about saving typing effort. It's about **optionality**. Building structure ahead of the feature that needs it means committing to a guess. When the real feature shows up shaped differently — which it usually is — you pay twice: once working around the wrong structure, again ripping it out. Waiting preserves the option to build the right thing once, when you actually know what it is.

Fowler's caveat matters: YAGNI isn't a license to skip refactoring or write fragile code. It only applies to capability built *for a presumed future feature*. Keeping code easy to change is what makes YAGNI safe in the first place — a codebase that's hard to modify is the one place premature structure actually pays off, because there's no cheap way to add it later.

## Worse is better

[Richard Gabriel's "Worse is Better"](https://en.wikipedia.org/wiki/Worse_is_better) essay (1989) observed that simpler, less "correct" designs routinely beat more complete, more principled ones — because they ship, get used, and evolve under real feedback while the elegant version is still being designed. Simplicity of implementation was, in his account, undervalued next to simplicity of interface and completeness. The lesson held up: a smaller thing in users' hands beats a bigger thing on a roadmap.

## The three virtues

Larry Wall, creator of Perl, named [laziness as the first virtue of a programmer](https://thethreevirtues.com/): "the quality that makes you go to great effort to reduce overall energy expenditure." The point isn't avoiding work — it's refusing to spend effort on anything that doesn't need to exist, so the effort that's left goes toward what does.

## What it costs to ignore this

This isn't just aesthetic preference. Estimates put the cost of technical debt — much of it downstream of premature abstraction and speculative architecture — at roughly **$2.4 trillion a year** for US businesses, with 23–42% of developer time spent servicing it rather than building. Every microservice split for scale nobody hit yet, every config system for a value that never changes, every interface with one implementation is a small YAGNI failure. They compound.

## The practical version

A simple ordering, cheapest option first, before writing anything new:

1. Does this need to exist at all?
2. Is it already solved somewhere in the codebase?
3. Does the standard library cover it?
4. Does the platform (browser, OS, database) already do this natively?
5. Does an already-installed dependency solve it?
6. Can it be one line?
7. Only then: the minimum new code that works.

Stop at the first rung that holds. The lazy answer, chosen after actually understanding the problem, is usually the right one — and it's the one that's still simple to change when the real requirement shows up.

## Related

- [[Digital Garden]]
