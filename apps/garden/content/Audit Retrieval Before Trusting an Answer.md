---
title: "Audit retrieval before trusting an answer"
description: "A practical protocol for checking corpus coverage, retrieval quality, and whether source records support an answer."
tags: [knowledge-management, engineering, research]
date: 2026-09-18
stage: budding
---

# Audit retrieval before trusting an answer

A search can return five plausible records while missing the record that changes the answer. Looking at the result list alone gives you no way to discover that omission.

For a personal knowledge system, start by separating three questions. Does the intended source exist in the collection? Can the search retrieve it? Does the answer represent its contents accurately? Each question needs its own check.

## Separate the failure stages

[LongMemEval](https://arxiv.org/abs/2410.10813) describes memory systems in terms of indexing, retrieval, and reading. Its evaluation covers information extraction, reasoning across sessions, temporal reasoning, knowledge updates, and abstention. Those distinctions give a useful starting point for an audit of [[Knowledge Management Systems]].

An indexing check compares an expected source inventory with the records actually available to search. Include source scope and access permissions: a record in another collection may exist without being available to this query. Changing a ranking threshold cannot recover a document that was never ingested.

A retrieval check starts with a known question and labeled supporting records. It asks which records appear in the returned set and which are missing. A reading check then compares the answer with the records it cites. Correct retrieval can still lead to an answer that confuses two people, overlooks a correction, or states an inference as a fact.

## Work through a small example

This example is illustrative. It is not a measurement of a deployed system.

Suppose the inventory contains 100 expected records. For one question, a reviewer labels 10 records as relevant. Search returns five records, four of which match those labels.

| Measure | Calculation | What it tells you |
| --- | --- | --- |
| Precision at 5 | 4 / 5 = 0.80 | The share of returned records labeled relevant |
| Recall at 5 | 4 / 10 = 0.40 | The share of labeled relevant records retrieved |
| Answer support | Review each claim against its cited passage | Whether the answer follows from the available evidence |

The denominator for recall is the relevant set for this question, not all 100 records. If the labels are incomplete or mistaken, the score cannot establish actual completeness. Neither retrieval measure tells you whether the final answer accurately represents the four relevant records.

## Establish a baseline before changing the system

The [BEIR benchmark](https://arxiv.org/abs/2104.08663) evaluates retrieval across varied tasks and domains. It reports a robust lexical baseline and strong average results for reranking and late interaction, with additional computational cost. That finding supports comparing methods on representative questions. It does not establish a best configuration for your collection.

Freeze a small corpus snapshot and write questions before looking at the search results. Include an exact-name lookup, a synonym query, a question requiring multiple records, a changed fact, and a question the collection cannot answer. For each answerable question, identify the expected evidence and the date it applies to. For an unanswerable question, specify what an appropriate abstention should say.

Run the same questions against the same snapshot when comparing retrieval methods. Keep the result limit fixed. Record latency alongside the results, then inspect each missing source. This makes an improvement in one category visible alongside a regression in another.

## Keep the audit inspectable

Use one row per question. The following worksheet keeps the expected evidence separate from what the system happened to return.

| Question | Expected records | Returned records | Supported claim | Failure stage |
| --- | --- | --- | --- | --- |
| Which deadline is current? | Original decision; later correction | Original decision | The old deadline only | Retrieval: correction missing |
| Who owns the release? | No supporting record in this snapshot | Related project notes | No owner established | Abstention required |

These rows are hypothetical. Replace them with examples from your own collection, keeping private records in a private evaluation set.

For consequential claims, read the original record rather than relying on its summary. Preserve the record identifier, source, applicable date, and passage supporting the claim. [W3C's provenance overview](https://www.w3.org/TR/prov-overview/) describes how information about the entities, activities, and people that produced data can inform an assessment of its reliability. Connecting a claim to its source makes that assessment possible; the connection alone does not establish truth. This extends ordinary [[Note Linking]] with a reason for each evidence link.

## Limits and maintenance

This protocol is a practical synthesis of evaluation and provenance ideas. It has not been validated as a complete evaluation methodology. A small labeled set will miss some failures, and public benchmarks cannot predict performance on a private corpus. Ambiguous sources and questions requiring several retrieval steps need additional review.

As part of [[System Design]], keep the worksheet beside the retrieval configuration. Re-run it after changing the index, chunking, source scope, or ranking method. When a production question fails, add a minimal example and its expected evidence so the next change can be checked against it.
