# Article tools and search data

The article audit runs locally. It does not require a new service. Use it to
check published HTML in bulk and review source edits before publishing.

## Optional services

| Need | Tool | Data dependency |
| --- | --- | --- |
| Persistent technical crawl reports | [SEOnaut](https://github.com/StJudeWasHere/seonaut) | Crawls public pages; Docker and MySQL. MIT licensed. |
| Scheduled keyword positions | [SerpBear](https://github.com/towfiqi/serpbear) | Self-hosted application, but needs a working SERP provider or proxies. MIT licensed. |
| Queries already reaching this site | [Search Console API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) | Google service and verified site access. Returns top rows, not guaranteed exhaustive data. |
| Own-site backlink sample | [Search Console Links report](https://support.google.com/webmasters/answer/9049606) | Google service; sample can include historical links. |

Start with the local audit and Search Console. Add SEOnaut only if a persistent
crawl dashboard is useful. Add SerpBear only when independently scheduled rank
tracking is needed. Its current README marks ScrapingRobot and ScrapingAnt as
nonworking even though introductory documentation mentions their free tiers.
Choose and verify a working data provider before deploying it.

Self-hosting these applications does not provide a fresh web-wide backlink
index, competitor traffic estimates, or market-wide keyword volumes. Those
require external datasets or large-scale crawling. SerpBear's optional Google
Ads and Search Console integrations still depend on Google accounts and APIs.

No service was deployed and no provider subscription was purchased for this
workflow. If deployed later, keep dashboards private, store credentials outside
the repository, persist data volumes, and pin a tested image digest or release.

Sources checked on 2026-09-25: the linked official documentation and repositories,
[SerpBear releases](https://github.com/towfiqi/serpbear/releases), and
[SEOnaut commit history](https://github.com/StJudeWasHere/seonaut/commits/main/).
