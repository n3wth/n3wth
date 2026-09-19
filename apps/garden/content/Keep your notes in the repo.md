---
title: "Keep your notes in the repo"
description: "For a personal digital garden, markdown in git beats a database. The vault is the source of truth, git is the history, and static output is the fastest thing you can serve."
tags: [knowledge-management, digital-garden, architecture]
date: 2026-09-18
stage: seedling
---

# Keep your notes in the repo

This garden is a few hundred markdown files committed to a repository and rendered into a static site. Every so often I ask whether the notes should live in a database instead. The answer keeps coming back no, and the reasons are worth writing down.

## What the repo gives you

- **One source of truth.** The notes are written in a local editor and the site is a projection of them. There is nothing to sync and nothing to drift.
- **History for free.** Planted dates, last-tended dates, and the growth stage of each note all derive from version control. A database would need a versions table and a job to maintain it.
- **Whole-corpus computation at build.** Backlinks, the link graph, and link degree are computed once over every note. That is trivial at build time and awkward as a write-time job.
- **Static output.** The fastest and cheapest thing an edge network can serve is a file. Search engines prefer it too.

## What a database would cost

- Rendering becomes dynamic, or you rebuild caching to get back what static already gave you.
- Backlinks and history need to be reimplemented as jobs or views.
- You now have two places content can live, and a sync path between them that can fail. Even with one source, a stale generated manifest has already broken my build once. Two sources multiply that.

## When a database is right

- **Other people's notes.** If the garden becomes a hosted product where each person publishes their own vault, content per tenant cannot live in one repository. That is a product decision, and it is the moment to add a database.
- **Runtime search.** Semantic search or a question-answering endpoint benefits from a vector index. Build it as a derived index, populated at build time, with the repo still the source.

## The pattern

Source of truth in plain files under version control. Derived indexes wherever they earn their place. Never the other way round.

Related: [[Atomic Notes]] on how the notes themselves are shaped, and [[Audit retrieval before trusting an answer]] on checking what an index actually contains.
