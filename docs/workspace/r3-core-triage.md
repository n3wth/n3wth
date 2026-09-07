# N-419 core triage

Read-only inspection September 6 2026 local time. PR62 remains OPEN at e98cd996ee116ba3c7309b51395a54295c7d01ba. Latest reported check `Test (Node 20, Redis 7)` still fails. Website build, lint/format and dependency review succeed. No test reruns or code changes performed.

Evidence: https://github.com/n3wth/r3/actions/runs/34073187153/job/101594250132

- test/test-suite.js:231 add memory: request timeout after 30 seconds.
- :246 search test: times out during its preceding add_memory setup, so this is not evidence that the actual search RPC ran.
- :402 concurrent add requests: fewer than eight promises fulfilled after 30 seconds.
- Intelligence suite separately reports 5 passed, 0 failed.

## Concrete source defect and next diagnostic

`src/index.ts:500` duplicate detection POSTs to `/v1/memories/search/`. Local-mode routing in `simulateLocalAPI` tests `endpoint.includes('/memories/') && method === 'POST'` before its more specific search branch. Therefore duplicate-check requests are routed into the add handler with an absent content/messages field. This is a confirmed routing defect from source, but not yet a proven explanation of every timeout.

Next bounded diagnostic: instrument or isolate local API dispatch to assert a search POST calls `localMemory.search` and never `localMemory.add`; capture readiness plus duplicate-check start/end for one add request. Then reproduce one add and its search using a deterministic local-memory fixture before repeating concurrency. Fix specific-route precedence with a regression test once confirmed in the executable build. Do not increase timeouts to mask the defect.

Two additional failure candidates need evidence:

1. LocalMemory is assigned before `await localMemory.start()`. simulateLocalAPI only awaits redisInitPromise when the reference is absent, while LocalMemory operations call start themselves until ready. Inspect startup wait/error handling and capture subprocess stderr rather than silently discarding it. Tests remove REDIS_URL and can trigger embedded Redis setup despite the CI Redis service. Determine whether startup/download or readiness is hanging before treating the cloud or vector model as cause.
2. Test sendRequest splits each stdout chunk into lines without preserving partial JSON across chunks. A fragmented response can be discarded and appear as a timeout. Add a deterministic split-frame parser test and use one buffered transport reader per child process. Current timers are also not cleared on success, complicating clean shutdown.

The concurrent assertion only counts fulfilled promises, even if an RPC returns an error; future regression should assert successful response bodies and persisted records. Keep this separate from website workspace migration and retain existing required CI gates.
