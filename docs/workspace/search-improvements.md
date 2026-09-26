# Search and article improvements

## Evidence and scope

This work covers n3wth.com and its 283 published article routes. Search Console exports cover July 17–September 23, 2026. The domain property includes subdomains. Only 74 articles matched exported page rows, mostly through historical Garden URLs; unmatched articles are unobserved, not proven to have zero traffic. Query totals must not be attributed to individual pages without a page-filtered export.

The Semrush audit dated September 15, 2026 inspected 31 pages, with JavaScript disabled and a 100-page cap. Its score was 93, with zero errors, 28 warnings and 30 notices. It flagged low word counts and pages with one incoming internal link. These are historical crawl findings, not a current full-site verdict.

On September 25, the existing campaign limit was raised to 500 pages and a new crawl was started. No plan upgrade was purchased. That crawl measures the live site before this branch is deployed.

Source exports are kept outside Git under `.release/search-console/`. Semrush project: 31233208; snapshot: `6aaa0c6e710d302a1d3ece59`.

## Changes

1. Render the 21 rich React articles from their authored components at build time. Previously every rich article exposed only a separate summary, zero subheadings and one outgoing link. Preserve prose, headings, citations and initial interactive state in the HTML. Keep browser interactions and lazy loading.
2. Carry reviewed modification dates through Markdown metadata, Article structured data, sitemap `lastmod` and Atom `updated`. Preserve original publication dates. Use source metadata and migration history rather than build timestamps.
3. Update the Astryx comparison to the current portfolio architecture and clarify component ownership. Consolidate duplicate tomato-pollination answers and remove unsupported diagnoses. Preserve citations, figures and existing article URLs.
4. Keep the repeatable whole-collection Yoast readability and structural audit. Readability scores are editorial suggestions, not an instruction to lengthen short notes.

## Keyword evidence

Semrush US keyword overview, retrieved September 25, 2026:

| Keyword | Estimated monthly volume | Difficulty |
| --- | ---: | ---: |
| astryx | 210 | 31 |
| do tomatoes self pollinate | 320 | 28 |
| component library vs design system | 20 | 0 |
| retrieval augmented generation evaluation | 20 | 0 |
| non comedogenic | 12,100 | 33 |
| hotel loyalty programs | 1,000 | 76 |

No rows were returned for `astryx vs shadcn` or `shadcn vs angular material`; that is not evidence of zero demand. Difficulty zero on sparse terms should not be treated as a ranking guarantee. Prioritize the existing technical comparison and gardening article because Search Console already shows relevant exposure. High volume alone does not justify expanding health claims or rewriting unrelated personal notes.

## Validation and release

Run `npm run check -w @n3wth/portfolio`, `npm run test:content-audit`, `npm run content:audit`, and `node scripts/check-built-metadata.mjs --apps portfolio` using Node 24. The portfolio check includes real component rendering and date regressions. Inspect built HTML and browser behavior on a rich essay and revised Markdown note.

Local validation covered all 283 articles with zero processing errors or structural findings, and 298 public pages with complete metadata. Rich article HTML now includes 32 subheadings, previously zero. Browser checks covered the desktop Field Guide, the comparison article at 390px, the latency slider's state change, and visible article chapters with JavaScript disabled. Canvas scenes still require JavaScript. Automated post-build checks guard the final article HTML and note dates across schema, sitemap and feed.

After deployment, confirm canonical routes return 200, the Garden redirects remain permanent, and rich article text and citations occur in the HTTP response without JavaScript. Check the sitemap and feed dates against their source metadata. Re-run Semrush within the existing plan limits. Search Console indexing, impressions and clicks require later observation; a build or an audit score does not establish ranking improvement.

Rollback if article rendering, routing or metadata regresses: revert these commits and redeploy the prior portfolio Worker version. No content database or domain migration is involved.
