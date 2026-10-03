---
title: Anki
description: Spaced repetition for long-term memory retention
tags: [learning, memory, tools, spaced-repetition]
---

# Anki

Anki is a spaced repetition software (SRS) that schedules flashcard reviews at optimal intervals for long-term retention. It exploits the testing effect and spacing effect—two of the most robust findings in learning science.

## How Spaced Repetition Works

Traditional studying crams information that quickly fades. Spaced repetition schedules reviews just before you'd forget, strengthening memory with minimal effort:

- Easy cards → longer intervals
- Hard cards → shorter intervals
- The algorithm adapts to your performance

<figure class="research-figure">
<a class="research-figure-image" href="/figures/knowledge/anki.svg" aria-label="Open full-size graphic: Rate the answer you recalled"><img src="/figures/knowledge/anki.svg" alt="After attempting recall and revealing the answer, an incorrect or missing answer leads to Again. A correct answer branches by effort: Hard for slow or doubtful recall, Good for some effort, Easy for no effort. The displayed next interval follows the rating." width="960" height="731" loading="lazy" decoding="async" /></a>
<figcaption>“Hard” still means the answer was correct. This conceptual rating guide follows the official manual; actual review intervals depend on the card and scheduler settings. Original diagram based on <a href="https://docs.ankiweb.net/studying.html">Anki Manual, Studying: Answer Buttons</a>.</figcaption>
</figure>

## Effective Anki Usage

**Keep cards atomic**: One fact per card. "What year did X happen?" not "Tell me everything about X."

**Use cloze deletions**: `{{c1::This text}}` creates fill-in-the-blank cards.

**Add context**: Include why something matters, not just the bare fact.

**Review daily**: Skipped days compound. 15 minutes daily beats 2 hours weekly.

**Make your own cards**: The creation process itself aids learning.

## When to Use Anki

Good for:

- Language vocabulary
- Medical/legal facts
- Programming syntax
- Historical dates and facts

Not ideal for:

- Conceptual understanding (use other methods first)
- Skills requiring practice (need actual doing)
- Information you don't need long-term

## Related

- [[Active Learning]]
- [[Deliberate Practice]]
