---
title: "Growth gates before growth work"
description: "Sequence growth on a side project by gates you can pass, not dates you can miss: measure, get indexed, check demand, take one real payment, then build."
tags: [product, growth, indie, strategy]
date: 2026-09-18
stage: seedling
---

# Growth gates before growth work

I run a handful of small sites. When I sat down to ask how they could grow, the honest first finding was that none of them could be measured. Most traffic was my own. No page had a conversion event. Half the hosts were not in the search index because their sitemaps were empty or broken. Any growth plan built on top of that would have been a plan built on noise.

So the plan became a sequence of gates instead of a calendar.

## The gates

1. **Measurement.** Exclude your own traffic, your preview deployments, and your automation from analytics. The analytics tool I use has a built-in filter for [internal and test users](https://posthog.com/tutorials/filter-internal-users); most tools have an equivalent. Add one event for each action you actually care about. Add one way to capture an email. Until this is true, every later number is fiction.
2. **Indexing.** A sitemap is how you [tell search engines which pages matter](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview); an empty or broken one tells them nothing. Fetch every sitemap in production, not from a local build. Check that each host has at least one indexed keyword. Fix the ones that return errors before you write a single new page.
3. **Demand.** Before building anything paid, have five real conversations with the people you think will pay. Do not build a billing screen until three of them say yes to a specific price.
4. **First dollar.** One real payment, from a stranger, through the real checkout. Not a test card: [sandbox payments](https://docs.stripe.com/test-mode) simulate the flow without moving real money, which is exactly why they prove nothing about demand. Growth modelling before this is fan fiction.
5. **Then the speculative bets.** Only now spend two days on the idea that might be big.

## Why gates and not dates

A date tells you when to feel bad. A gate tells you what is true. Gates also compose well with limited hours: each one is small, each one produces evidence, and none of them can be skipped by working harder on the next one.

## What "exponential" actually needs

It needs a loop where use creates distribution. An install command that carries the source's address. A published site that links back to the tool that made it. A skill that names where it came from. A portfolio site has no such loop, and no amount of content fixes that. If you cannot name the loop, you are not on an exponential curve, you are on a linear one with good intentions.

## Limits

This is one operator's sequence for small sites with no paid acquisition. It says nothing about products that already have traffic, and the gate thresholds (five conversations, three yeses) are judgment calls, not measured optima.

See also [[Productive Laziness in Engineering]] for the same instinct applied to code, and [[Audit retrieval before trusting an answer]] for the habit of checking coverage before trusting a result.
