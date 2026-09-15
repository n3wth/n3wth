# n3wth traffic growth

## Objective

Grow traffic 100×. This is an outcome target, not a forecast. Source changes alone do not establish traffic growth. Deployments remain manual and require a release request.

## Baseline captured September 14, 2026

PostHog project 223560, August 17–September 13, 2026:

- 914 sessions, 769 visitors and 1,410 pageviews.
- Exact host filter: n3wth.com, skills.n3wth.com, garden.n3wth.com, kit.n3wth.com and r3.n3wth.com.
- Provisional target: 91,400 sessions over an equivalent 28-day window.
- This is an all-channel baseline, not organic-only. No governed metric exists in the project's catalog.
- With session property `$channel_type = Organic Search` added to the same query: 85 sessions, 68 visitors and 115 pageviews. The provisional organic target is 8,500 sessions per equivalent 28-day window. This is separate from the all-channel target.
- UI-docs was not present in returned host values; verify tracking coverage before treating this as a complete six-site baseline.
- Default test-account filtering was disabled for this query because its host exclusion uses `not_regex` against localhost. The explicit production-host filter excludes local traffic. Internal traffic on production may remain; audit classification before finalizing the target.

Semrush US domain_rank for n3wth.com: 51 organic keywords and estimated organic traffic of 1. This estimate is separate from measured PostHog sessions and must not substitute for the first-party baseline.

## First changes

- Remove the 14 public skill exclusions from Vercel headers. HTML metadata and sitemap inclusion derive from the same configuration.
- Allow crawling and indexing of public community analytics, requests, playground and workflow creation pages; include them in the sitemap.
- Include the portfolio privacy page in the sitemap and remove its noindex directive.
- Supply missing social images on newly indexable public pages.
- Repair UI-docs analytics: the SDK's `p.n3wth.com` endpoint did not resolve; `elephant.n3wth.com/static/array.js` returned HTTP 200. Use the working endpoint and remove the duplicate HTML tracker. Production ingestion still needs verification after an authorized release.
- Keep errors, account transitions and private/local workflow editor states out of search results.
- Improve skill-creator's description and example: describe the actual Markdown workflow, include frontmatter and validation prompts, and remove broken nested code fences. Keep compatibility claims limited to the current Antigravity catalog support.

## Priorities from Semrush

| Landing page | Query | US position | Monthly search volume |
| --- | --- | ---: | ---: |
| skills /skill/skill-creator | skill-creator | 36 | 1,900 |
| skills /skill/skill-creator | claude code skill creator | 26 | 320 |
| skills /skill/skill-creator | claude skill builder | 41 | 210 |
| garden /tomatoes-self-pollinate | how do tomatoes pollinate | 60 | 390 |
| skills /skill/sql-optimizer | sql query optimizer | 78 | 50 |

These are sampled keyword opportunities, not additive traffic forecasts.

## Next work

1. Verify analytics coverage for all six sites and settle a reproducible organic-session metric alongside total sessions.
2. Validate a release of the indexing changes when requested, including response headers, rendered robots tags, sitemap membership and canonical URLs.
3. Verify the improved skill-creator page after release. Confirm source behavior before targeting Claude-specific queries: the current catalog and live site differ. The local example now includes frontmatter, one task, trigger criteria, implementation steps and matching/unrelated validation prompts.
4. Audit and improve existing ranking garden and SQL pages before expanding into new query topics.
5. Measure indexing, impressions, clicks, sessions and useful product actions over comparable windows. Record each release and avoid attributing ranking changes to edits without sufficient observations.
