# Upstream contribution opportunities

Audited September 18, 2026 through the GitHub connector. Scope: current contribution guidance, open documentation/evaluation issues, relevant implementation/examples, and open PRs in `beir-cellar/beir` and `pgvector/pgvector`. These are contribution candidates, not reproduced fixes or maintainer approvals. No upstream messages, issues, or PRs were created; no builds or benchmarks were run.

Observed default-branch heads: BEIR `main` at `ef83d29307061c65d04b035b4f4e7c18bd8374af`; pgvector `master` at `efa08fda9ec485d80292d0487a77939c087dedcc`. Recheck issue ownership and current code before implementation.

## 1. BEIR: document reproducible query subsets for quick evaluation

**Issue:** [#216 — Allow sampling test query](https://github.com/beir-cellar/beir/issues/216). Open, unassigned, no comments at inspection; last updated June 16, 2026. Relevant to G04's small regression set and G01's fixed-corpus audit.

**Evidence and gap.** The reporter requests a ratio or absolute query count to reduce evaluation work. The current [dense evaluation example](https://github.com/beir-cellar/beir/blob/ef83d29307061c65d04b035b4f4e7c18bd8374af/examples/retrieval/evaluation/dense/evaluate_sbert.py) passes the complete loaded query set to retrieval and evaluation. [EvaluateRetrieval](https://github.com/beir-cellar/beir/blob/ef83d29307061c65d04b035b4f4e7c18bd8374af/beir/retrieval/evaluation.py) accepts query/qrels dictionaries but provides no sampling parameter. The inspected example does not show how to preserve a reproducible subset and matching judgments.

**Useful contribution.** Add a small example beside the existing evaluation examples that:

- Selects a bounded number of query IDs from a stable ordering with a local random seed, then saves the selected IDs for reuse.
- Subsets both `queries` and `qrels` to those IDs while retaining the complete corpus and each selected query's document judgments.
- Records the dataset/split, selection seed and IDs, retrieval configuration, and subset size alongside results.
- Labels the output as a subset smoke/regression evaluation, with no claim that its average equals the full benchmark. Explain that query sampling does not eliminate full-corpus encoding cost in the current dense search path.

This addresses the user's workflow without requiring a new public API. It is narrower than the requested API enhancement; maintainer acceptance of the example approach is not established.

**Contribution rules and overlap.** No `CONTRIBUTING` or contribution-template file appeared in the inspected repository tree. The [README](https://github.com/beir-cellar/beir/blob/ef83d29307061c65d04b035b4f4e7c18bd8374af/README.md) invites issue reports/questions and describes the software as experimental. Python formatting/lint configuration uses [Ruff pre-commit hooks](https://github.com/beir-cellar/beir/blob/ef83d29307061c65d04b035b4f4e7c18bd8374af/.pre-commit-config.yaml), pinned to v0.9.4. No query-sampling example PR appeared in the open-PR listing. [PR #218](https://github.com/beir-cellar/beir/pull/218) already addresses single-query exact search; do not duplicate that fix. The inspected [dense search implementation](https://github.com/beir-cellar/beir/blob/ef83d29307061c65d04b035b4f4e7c18bd8374af/beir/retrieval/search/dense/exact_search.py) still indexes `cos_scores[1]`, so a one-query sample needs that dependency resolved or an explicit example constraint.

**Validation before a PR.** Demonstrate repeatable selected IDs, identical query/qrels key sets, an unchanged corpus, and expected metrics on a tiny hand-labeled fixture. Cover invalid sample sizes and distinguish subset results from a full run. Check #218's status before claiming one-query support. No performance savings or passing-test claims have been established by this audit.

## 2. pgvector: clarify that removing LIMIT does not establish an exact baseline

**Issue:** [#846 — Unexpected use of Index Scan in ANN query without LIMIT or enable_indexscan](https://github.com/pgvector/pgvector/issues/846). Open, unassigned at inspection; last updated February 11, 2026. Relevant to G05's comparison of retrieval methods on the same questions: its vector baseline must have a verified query plan.

**Evidence and gap.** The reporter's pgvector 0.8.0 example shows a partitioned HNSW query without `LIMIT` returning 160 rows, versus 4,997,869 with `enable_indexscan = off`. These are reported results, not measurements repeated here. The maintainer [confirmed the unexpected plan](https://github.com/pgvector/pgvector/issues/846#issuecomment-2910940024) and [attributed it to the high estimated external-sort cost under default work_mem](https://github.com/pgvector/pgvector/issues/846#issuecomment-2917869305). The inspected [README troubleshooting section](https://github.com/pgvector/pgvector/blob/efa08fda9ec485d80292d0487a77939c087dedcc/README.md#troubleshooting) still says an index query “needs to have an ORDER BY and LIMIT.” Its [monitoring section](https://github.com/pgvector/pgvector/blob/efa08fda9ec485d80292d0487a77939c087dedcc/README.md#monitoring) already gives the correct transaction-scoped `SET LOCAL enable_indexscan = off` baseline pattern, but does not connect it to this documented planner exception.

**Useful contribution.** Make a focused troubleshooting clarification: the normal indexed query pattern is not a guarantee that omitting `LIMIT` produces exact results. Link internally to the existing monitoring recipe and show a small `EXPLAIN (ANALYZE, BUFFERS)` comparison that verifies the approximate versus exact execution paths. Keep the same corpus, query, distance operator, and result limit when comparing retrieval quality. Describe the partitioned-table case with its verified version and conditions rather than generalizing it to every installation.

**Contribution rules and overlap.** The [Contributing section](https://github.com/pgvector/pgvector/blob/efa08fda9ec485d80292d0487a77939c087dedcc/README.md#contributing) explicitly welcomes writing, clarifying, and fixing documentation; code changes use regression and TAP checks (`make installcheck`, `make prove_installcheck`). No separate contribution file appeared in the root or `.github` listing. A [volunteer already proposed a cost-estimation benchmark](https://github.com/pgvector/pgvector/issues/846#issuecomment-3882085315); the opportunity here is the narrow documentation correction, not another planner benchmark or cost-model implementation. No matching documentation PR appeared in the inspected open-PR listing. Recheck that volunteer's progress before implementation.

**Validation before a PR.** Reproduce the relevant plans on an explicitly recorded PostgreSQL/pgvector version, verify the transaction-scoped exact baseline, and confirm whether the no-`LIMIT` exception remains on the target version. Do not repeat the historical row counts as current behavior without reproducing them. If current code fixes the exception, limit the correction to an accurate version-qualified explanation or drop it.

## Scope exclusions

pgvector already has a [hybrid-search section](https://github.com/pgvector/pgvector/blob/efa08fda9ec485d80292d0487a77939c087dedcc/README.md#hybrid-search) linking reciprocal-rank-fusion and cross-encoder examples in its Python client. A generic G05 tutorial or article link would duplicate existing guidance. The bounded open-issue search did not establish a missing hybrid-search example.

Neither candidate requires a link to n3wth.com or the garden. Put the useful example or correction directly in the upstream project and cite its own issue, implementation, and documentation.

