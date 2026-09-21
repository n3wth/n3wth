---
title: How OpenClaw Dreaming Works
tags:
  - openclaw
  - artificial-intelligence
  - memory-consolidation
  - engineering
date: 2026-06-10
description: A detailed research report exploring the inner workings of OpenClaw's autonomous background memory consolidation sweeps, sleep-inspired phases, scoring logic, and operational tuning.
---

# How OpenClaw Dreaming Works

Dreaming is OpenClaw's background memory-consolidation system, built natively into `memory-core`. While the agent is idle, it replays recent short-term material — daily memory files, recall state, redacted transcripts — through three sleep-inspired phases, and promotes only the strongest candidates into long-term durable memory (`MEMORY.md`).

Three design properties distinguish it from the resource-heavy vector-database side-stacks that preceded it:

*   **Explainable:** Every cycle leaves a human-readable audit trail in `DREAMS.md`. You can read exactly what was promoted, what decayed, and why.
*   **Conservative:** Exactly one phase is allowed to write durable memory, and it must pass three threshold gates first. Nothing is deleted — unpromoted memories simply decay.
*   **Self-contained:** No second memory stack, no embedding pipeline, no vector DB. It reuses the agent's existing file-based memory with a managed cron job.

---

## 1. The Problem of Session Drift

Agents accumulate daily notes fast — commonly 10 KB+ per active day. Without consolidation, that history produces **session drift**: the agent forgets key decisions, repeats past mistakes, and loses crucial project context once notes age out of the short-term retention window or get compacted away.

Prior to Dreaming, the only workarounds were manually pinning important notes or running a separate vector-memory pipeline alongside the agent. Both required ongoing human curation. Dreaming automates this curation step: the agent decides, on a schedule and against explicit scoring gates, what deserves to survive.

The biological framing is deliberate and reasonably faithful. During sleep, the human brain replays experiences and transfers the important ones to long-term storage; the rest fade. Dreaming is the same shape: replay short-term traces, strengthen what recurs, and let the noise decay.

---

## 2. The Three Sleep Phases

A full sweep runs the phases in order: **Light → REM → Deep**. Light and REM are read-and-stage passes that never touch durable memory; Deep is the only phase with write authority over `MEMORY.md`.

<svg viewBox="0 0 760 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; margin: 32px 0; background:#0a0f1d; border-radius:12px; border:1px solid #1f2937; padding:24px;">
  <rect x="20" y="20" width="200" height="140" rx="8" fill="#111827" stroke="#333e4f" stroke-width="1"/>
  <rect x="20" y="20" width="200" height="4" rx="4" fill="#3b82f6"/>
  <text x="120" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Light Sleep</text>
  <text x="120" y="85" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Sort & Stage Temp</text>
  <rect x="75" y="115" width="90" height="20" rx="10" fill="#1e293b" stroke="#374151" stroke-width="1"/>
  <text x="120" y="129" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="10" font-weight="600" text-anchor="middle">READ-ONLY</text>

  <path d="M235 90 H265" stroke="#4b5563" stroke-width="2" stroke-linecap="round"/>
  <path d="M260 85 L267 90 L260 95" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

  <rect x="280" y="20" width="200" height="140" rx="8" fill="#111827" stroke="#333e4f" stroke-width="1"/>
  <rect x="280" y="20" width="200" height="4" rx="4" fill="#f43f5e"/>
  <text x="380" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">REM Sleep</text>
  <text x="380" y="85" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Reflect & Connect</text>
  <rect x="335" y="115" width="90" height="20" rx="10" fill="#1e293b" stroke="#374151" stroke-width="1"/>
  <text x="380" y="129" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="10" font-weight="600" text-anchor="middle">READ-ONLY</text>

  <path d="M495 90 H525" stroke="#4b5563" stroke-width="2" stroke-linecap="round"/>
  <path d="M520 85 L527 90 L520 95" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

  <rect x="540" y="20" width="200" height="140" rx="8" fill="#111827" stroke="#10b981" stroke-width="1" style="filter: drop-shadow(0px 0px 4px rgba(16,185,129,0.15));"/>
  <rect x="540" y="20" width="200" height="4" rx="4" fill="#10b981"/>
  <text x="640" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Deep Sleep</text>
  <text x="640" y="85" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Score & Promote</text>
  <rect x="585" y="115" width="110" height="20" rx="10" fill="#064e3b" stroke="#047857" stroke-width="1"/>
  <text x="640" y="129" fill="#34d399" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">DURABLE WRITE</text>
</svg>

### Light Sleep — Sort and Stage
*   **Action:** Reads short-term recall state, recent daily memory files (`memory/YYYY-MM-DD.md`), and redacted session transcripts where available.
*   **Output:** Writes a managed `## Light Sleep` block when inline output is enabled.
*   **Impact:** Records reinforcement signals consumed later by deep ranking. Never writes to `MEMORY.md`.

### REM Sleep — Reflect and Associate
*   **Action:** Builds theme and reflection summaries from recent short-term traces — the "what keeps coming up" pass.
*   **Output:** Writes a managed `## REM Sleep` block; records REM reinforcement signals used by deep ranking.
*   **Impact:** Integrates associations but never writes to `MEMORY.md`.

### Deep Sleep — Score and Promote
*   **Action:** Ranks candidates using a weighted scoring algorithm, then applies three gates that must *all* pass: `minScore`, `minRecallCount`, and `minUniqueQueries`.
*   **Output:** Appends promoted entries to `MEMORY.md`, writes a `## Deep Sleep` summary into `DREAMS.md`, and optionally archives a per-day record at `memory/dreaming/deep/YYYY-MM-DD.md`.
*   **Impact:** Rehydrates snippets from live daily files immediately before writing — if the source note was edited or deleted since staging, the stale snippet is skipped rather than promoted blind.

> [!warning] Architecture Safeguard
> Several third-party guides incorrectly describe REM as the phase that writes long-term memory, with Deep doing the scoring. The official architecture is stricter: **Deep Sleep is the only durable writer.** REM is read-only reflection. If you're auditing a Dreaming install, watch `MEMORY.md` mutations during the deep phase only — a durable write during light or REM indicates a misconfigured or non-standard build.

---

## 3. Scoring, Decay, and What Survives

Promotion is intentionally hard to earn. A candidate must be important (score above `minScore`), demonstrably useful (recalled at least `minRecallCount` times), and broadly useful (matched by at least `minUniqueQueries` distinct queries). One-off trivia that the agent never touched again will not pass the gates, no matter how interesting it looked on the day.

<svg viewBox="0 0 760 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; margin: 32px 0; background:#0a0f1d; border-radius:12px; border:1px solid #1f2937; padding:24px;">
  <!-- Incoming Candidate -->
  <rect x="20" y="70" width="140" height="80" rx="8" fill="#111827" stroke="#4b5563" stroke-width="1"/>
  <text x="90" y="105" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Candidate</text>
  <text x="90" y="125" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Memory Trace</text>

  <!-- Arrow -->
  <path d="M175 110 H205" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4 4"/>
  <path d="M200 106 L206 110 L200 114" stroke="#9ca3af" stroke-width="1.5"/>

  <!-- Gate 1: minScore -->
  <rect x="220" y="45" width="130" height="130" rx="12" fill="#111827" stroke="#374151" stroke-width="1"/>
  <circle cx="285" cy="80" r="20" fill="#3b0764" stroke="#9333ea" stroke-width="1.5"/>
  <text x="285" y="84" fill="#a855f7" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">0.6</text>
  <text x="285" y="130" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">minScore</text>
  <text x="285" y="150" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Importance Gate</text>

  <!-- Gate 2: minRecallCount -->
  <rect x="375" y="45" width="130" height="130" rx="12" fill="#111827" stroke="#374151" stroke-width="1"/>
  <circle cx="440" cy="80" r="20" fill="#3b0764" stroke="#9333ea" stroke-width="1.5"/>
  <text x="440" y="84" fill="#a855f7" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">2x</text>
  <text x="440" y="130" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">minRecallCount</text>
  <text x="440" y="150" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Usefulness Gate</text>

  <!-- Gate 3: minUniqueQueries -->
  <rect x="530" y="45" width="130" height="130" rx="12" fill="#111827" stroke="#374151" stroke-width="1"/>
  <circle cx="595" cy="80" r="20" fill="#3b0764" stroke="#9333ea" stroke-width="1.5"/>
  <text x="595" y="84" fill="#a855f7" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">2q</text>
  <text x="595" y="130" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">minUniqueQueries</text>
  <text x="595" y="150" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Breadth Gate</text>

  <!-- Success Arrow -->
  <path d="M675 110 H700" stroke="#10b981" stroke-width="2"/>
  <path d="M695 105 L702 110 L695 115" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Promoted -->
  <circle cx="725" cy="110" r="14" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <path d="M719 110 L723 114 L731 106" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

Two decay parameters shape the candidate pool itself:

| Parameter | Effect |
| :--- | :--- |
| `recencyHalfLifeDays` | How fast a memory's weight decays with age. Lower values bias the agent toward recent context; higher values preserve older material longer. |
| `maxAgeDays` | Hard cutoff. Memories older than this are no longer eligible for promotion at all. |

Nothing is force-deleted. Dreaming promotes; it does not prune. Unpromoted short-term memories fade on their normal retention schedule, and `MEMORY.md` is treated as append-and-refine — entries may be deduplicated or merged, but the file is additive.

---

## 4. The Dream Diary

Beyond the mechanical phase blocks, Dreaming keeps a narrative log in `DREAMS.md`. After each phase has enough material, `memory-core` runs a best-effort background subagent turn and appends a short diary entry — a few sentences of "what tonight's sweep noticed."

The diary runs on the default runtime model unless `dreaming.model` overrides it (useful for routing consolidation to a cheaper model). If the configured model is unavailable, it retries once with the session default; trust and allowlist failures surface as errors rather than silently falling back.

Operationally, the diary is the fastest health check there is: a `DREAMS.md` that stopped gaining entries means the sweep stopped running.

---

## 5. Scheduling and Execution

When Dreaming is enabled, <code>memory-core</code> auto-manages a single cron job that performs the full sweep (light → REM → deep). You don't hand-schedule the phases.

*   **Activity guard:** Sweeps respect a quiet-period check so consolidation doesn't fire mid-conversation. The guard reads persisted session-store `updatedAt` timestamps rather than in-memory state, so it survives gateway restarts — an early design that tracked activity in a volatile singleton was rejected for exactly this reason.
*   **Workspace fan-out:** The sweep covers the primary runtime workspace plus any configured agent workspaces, deduplicated by path, so subagent workspaces don't crowd out the main agent's `DREAMS.md` and memory state.
*   **Non-blocking:** Consolidation runs in the background and yields to live sessions; a sweep overlapping a conversation does not slow the conversation.
*   **Manual trigger:** The `/dreaming` chat command triggers or inspects a cycle on demand; results from manual and scheduled runs both land in the diary.

---

## 6. Configuration Spec

All settings live under `plugins.entries.memory-core.config.dreaming`. A representative setup:

```yaml
plugins:
  entries:
    memory-core:
      config:
        dreaming:
          enabled: true            # opt-in; off by default
          schedule: "0 3 * * *"    # nightly sweep, 3 AM
          model: gemma3-local      # optional cheaper model for consolidation
          minScore: 0.6            # promotion gate 1: importance
          minRecallCount: 2        # promotion gate 2: proven usefulness
          minUniqueQueries: 2      # promotion gate 3: breadth
          recencyHalfLifeDays: 14  # age-decay half-life
          maxAgeDays: 60           # hard eligibility cutoff
```

Restricting `dreaming.model` further requires the subagent allowlist (`plugins.entries.memory-core.subagent.allowedModels`); model failures stay visible rather than degrading silently.

---

## 7. Operations and Troubleshooting

| Symptom | Diagnosis | Solution |
| :--- | :--- | :--- |
| `openclaw memory status` reports `Dreaming status: blocked` | The managed cron exists but the default agent heartbeat isn't firing. | Confirm heartbeat is enabled and its target isn't `none`, then re-check with `openclaw memory status --deep` after the next heartbeat interval. |
| `DREAMS.md` stopped gaining entries | Sweep isn't running. | Check the managed cron job and the activity guard's quiet window. |
| Nothing ever gets promoted | Gates are too strict for your usage volume. | New agents with little history won't clear `minRecallCount`/`minUniqueQueries`; either lower the gates or let history accumulate. |
| Stale facts being promoted | Snippet synchronization failure. | Deep rehydrates from live daily files and skips deleted snippets. If observed, verify you're on a current `memory-core` and not a fork. |
| CPU spikes on small hardware | Excessive batch processing. | Cap the per-cycle batch (`maxReplayBatch`-style limits) or schedule sweeps further apart. |

---

## 8. Architectural Assessment

The strongest part of the design is **restraint**. Most "agent memory" systems fail open — they hoard everything and drown in their own context. Dreaming fails closed: three gates, one writer, full audit trail, no deletions. That makes it boring to operate, which is the correct property for memory infrastructure.

The weakest part is **cold start**. The gates that protect a mature agent from noise also mean a fresh install sees no visible benefit for days or weeks, and the temptation is to lower thresholds until promotion happens — at which point you've rebuilt the hoarding problem with extra steps. Better defaults here would be adaptive gates keyed to history volume.

The architecture also quietly resolves the consolidation-vs-recall tradeoff by keeping both layers in plain Markdown. There is no embedding index to drift out of sync, and every artifact — `MEMORY.md`, `DREAMS.md`, per-day deep archives — is diffable, greppable, and reviewable in a pull request. For a single-operator agent, that beats a vector store on every axis except semantic fuzzy recall, which short-term search still covers.

---

## Sources

1. OpenClaw documentation — [Concepts: Dreaming](https://docs.openclaw.ai/concepts/dreaming) (memory-core; phase table, gates, diary, sweep, troubleshooting).
2. openclaw/openclaw — [PR #19685: Dreaming Process — Autonomous Memory Consolidation](https://github.com/openclaw/openclaw/pull/19685) (design rationale, activity guard, quiet hours).
3. openclaw/openclaw — [PR #59262: memory-sleep skill](https://github.com/openclaw/openclaw/pull/59262) (NREM/REM-inspired consolidation cycle, session-drift framing).
4. OpenClaw Launch — [Dreaming guide](https://openclawlaunch.com/guides/openclaw-dreaming) and [background memory guide](https://openclawlaunch.com/blog/openclaw-dreaming-background-memory-guide) (decay parameters, scoring overview, CLI usage).
5. OpenClaw DC — [Dreaming explained](https://openclawdc.com/blog/openclaw-dreaming-memory/) (idle replay, no-second-stack design, rollout defaults).
