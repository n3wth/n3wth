# Retired project sites

Cloudflare edge redirects now replace the separate r3 and Kit websites.

- `r3.n3wth.com` returns 308 to `https://n3wth.com/projects/r3`.
- Its `/docs` and former introductory pages redirect to the r3 quickstart on
  `docs.n3wth.com`. Former API, integration and SDK pages retain their mapped
  documentation destinations. Remaining `/docs/*` paths preserve the suffix.
- `kit.n3wth.com` returns 308 to `https://n3wth.com/projects/ui`.
- Query strings are preserved.

Rules live in the existing n3wth.com dynamic redirect ruleset
`23d1d7aef74e4d6cb011d9f88547353b`, alongside the preserved support and r2 rules.
The two hostnames use proxied placeholder DNS records. Their Worker custom
domains and the `n3wth-r3-web` and `n3wth-kit` Workers were removed after the
redirect destinations and representative documentation paths passed live checks.

The deployment list excludes r3 and Kit. Existing r3 code remains available for
reference and tests, but automatic production/preview builds do not deploy it.
Preview identity support remains solely so older r3 previews can be removed.
The r3 newsletter topic and draft template remain available for project updates;
the old site's signup form is no longer a live consumer.

Rollback requires an explicit decision to restore a site: deploy its historical
source, replace the placeholder record with the Worker custom domain, then
disable only its redirect rules. Do not reconnect the retired Vercel projects.
