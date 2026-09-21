# Historical newsletter import

This utility prepares and imports historical `email_captured` signups. It sends no emails and never changes historical PostHog records. Live import remains blocked until N-776 production cutover is verified. Run it with Node 24.

## Private input

Keep all export files outside the repository and Linear. Use restrictive file permissions. JSON input is an array of objects; CSV has lowercase headers. Each record needs:

| Field | Meaning |
| --- | --- |
| `event` | Must equal `email_captured`. Other events are excluded. |
| `person_id` | Historical PostHog person identifier. |
| `email` | Address supported by the historical evidence. |
| `source` or `url` | `home`, `skills`, `garden`, `r3`, `ui`, or the signup event's canonical HTTPS URL. Legacy aliases `portfolio`, `r3-web`, `ui-docs` normalize to their canonical source. |
| `provenance_verified` | Boolean `true`, or CSV `true`, only after reviewing the evidence. |

The old event had no explicit email payload. Current person properties are mutable. Confirm the project's person-property mode and compare available event-time evidence before setting `provenance_verified`. A current address alone does not establish which address signed up historically. Never fill missing evidence by guessing. Conflicting addresses for one person, missing provenance, unknown origins and conflicting source/URL are excluded. Multiple verified sources for one normalized address retain all those source topics. Duplicate rows do not create duplicate contacts.

PostHog project `n3wth` is `223560`. Verify live schema and event names before exporting. Inspect only the required person/email/event/source evidence, not whole profiles. Keep ambiguous cases in a private review file and publish only counts.

## Configuration

Create a private JSON configuration containing the verified newsletter segment and all five topic IDs:

```json
{
  "segmentId": "verified-newsletter-segment-id",
  "topicIds": {
    "home": "verified-home-topic-id",
    "skills": "verified-skills-topic-id",
    "garden": "verified-garden-topic-id",
    "r3": "verified-r3-topic-id",
    "ui": "verified-ui-topic-id"
  }
}
```

Use a separate test segment and topics for any provider integration test. Credentials come from `RESEND_API_KEY`; never place them in input, configuration or command arguments.

## Run and reconcile

```sh
# Offline dry-run: validates provenance and reports aggregate eligibility only.
node scripts/resend-newsletter-import.mjs --input /private/export.json --config /private/config.json

# Provider dry-run: reads live suppression, contact, topic and segment state; no writes.
node scripts/resend-newsletter-import.mjs --input /private/export.json --config /private/config.json --check-provider

# Only after verified live cutover and reviewed dry-run counts.
node scripts/resend-newsletter-import.mjs --input /private/export.json --config /private/config.json --apply --live-cutover-confirmed

# Focused tests use mocks and never contact providers.
node --test scripts/resend-newsletter-import.test.mjs
```

All output is aggregate counts. Provider bodies, addresses and input records are never logged. Save aggregate reports with the deployment evidence. For each provider run, `eligibleContacts` equals imported + existing + wouldImport + wouldUpdate + skippedSuppressed + skippedUnsubscribed + skippedTopicOptOut + failed. The `existing` count includes active contacts whose missing membership was repaired. Row-level exclusion counts describe input rows; eligible contacts are deduplicated, so these units differ.

The importer checks `/suppressions/{email}` and fails closed on provider errors. It never removes suppressions or writes `unsubscribed: false`. It skips globally unsubscribed contacts. For existing contacts, it conservatively skips the entire contact if any requested topic is `opt_out`. Resend currently returns inherited default `opt_out` and explicit `opt_out` identically, so migration cannot safely distinguish them. Review that aggregate separately; do not override it automatically. New contacts are created with verified topic choices.

Requests run sequentially at less than two per second, with bounded Retry-After handling, read retries and request timeouts. Uncertain writes are not retried automatically. Rerun the same private input to repair partial segment membership without duplicate contacts or reactivation. Every successful record is read back to confirm active contact, requested topics and newsletter segment membership. If a concurrent preference change or ambiguous default prevents recovery, it is skipped or failed for private review. The API does not provide atomic compare-and-set preference updates; avoid running concurrent subscription tools during this one-time migration.

N-777 is complete only after the production import and reconciliation. Utility tests alone do not satisfy that acceptance condition. Record branch/PR, test results, release evidence, aggregate counts, exceptions and next steps in Linear. Do not send a campaign or welcome email.
