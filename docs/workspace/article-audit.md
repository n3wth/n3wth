# Bulk article audit

The audit reads every `https://n3wth.com/thinking/*` URL from the portfolio's built sitemap. It analyzes local prerendered HTML with YoastSEO.js and the site's existing metadata validator. No server, browser automation, account, or external API is needed.

Run from the repository root with Node 24 after installing dependencies:

```sh
npm run build:portfolio
npm run content:audit
npm run test:content-audit
```

Reports go to `.release/article-audit/articles.json` and `.release/article-audit/summary.md`. The directory is ignored by Git. To keep separate before/after results:

```sh
node scripts/article-audit.mjs --output .release/article-audit-before
node scripts/article-audit.mjs --dist apps/portfolio/dist --output .release/article-audit-after
```

Rebuild before auditing edited articles. The audit does not read unbuilt source edits.

YoastSEO.js is pinned as a development dependency and is GPL-3.0 licensed. It
runs in the audit process and is not imported into the public site bundle.

## What it checks

- Coverage: every unique article URL in the sitemap appears in the JSON report, including failed reads. Missing sitemap or zero matching articles fails the command. Individual failures are retained in the report and produce a nonzero exit code.
- Metadata: reuse `checkPublicDocument` from `scripts/check-built-metadata.mjs`. This reports the first metadata violation per article; the full metadata check remains part of repository validation.
- Structure: canonical URL matches the sitemap URL, one article H1, and images have an `alt` attribute. Empty alt text is allowed for decorative images.
- Readability: Yoast's English content assessor evaluates text inside `main`, excluding navigation, footers, scripts, templates and explicitly hidden elements. Scripts and remote resources never execute.
- Internal links: same-origin destinations must exist in the local build. Missing destinations are review candidates. Runtime routes and redirects can work without a local file. Fragments are listed as unchecked; their presence is not proof that the anchor exists.

The raw Yoast scores and assessment text are preserved in JSON. A readability score is neither a Semrush score nor a prediction of ranking. Yoast can suggest more text on short notes; the audit imposes no minimum length. Keep a short note short when it says what it needs to say. Do not add transition words, headings or filler just to increase a score.

Keyphrase SEO is explicitly skipped because the site has no reviewed per-article target-keyphrase input. Search volume, keyword difficulty, competitor coverage, backlinks, external link availability and live rankings are outside this offline audit.

## Add Search Console context

Use the verified `sc-domain:n3wth.com` property in Search Console. Open Performance,
select the reporting period and Web search, then export CSV. Keep the original ZIP
under `.release/search-console/`; these private analytics stay out of Git.

Match `Pages.csv` URLs against the article report. For old `garden.n3wth.com` URLs,
use `apps/garden/redirects.json` and label the match as historical. Retain the source
URL and reporting dates. Do not treat an absent row as zero traffic or evidence that
a page is not indexed. The domain property includes other subdomains.

Query and page exports are separate aggregations. To choose a target keyphrase,
filter Search Console to that page and inspect its query report. Do not join all
queries to pages by guesswork. This is an explicit export workflow, not a scheduled
API integration.

## Editing with subagents

Assign each editor a distinct list of source files. Preserve facts, citations, URLs, art credits and the site's plain voice. Review suggested changes before publication. Rebuild and rerun the audit after the edits, then compare the per-article results. Local reports and edited drafts do not establish that production changed.
