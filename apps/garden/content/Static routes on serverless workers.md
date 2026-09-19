---
title: "Static routes on serverless workers"
description: "A route handler that reads the filesystem at request time will build fine and fail in production on edge workers. Prerender it."
tags: [engineering, nextjs, cloudflare, seo]
date: 2026-09-18
stage: seedling
---

# Static routes on serverless workers

A sitemap on one of my sites returned an internal server error for months. The build passed every time. Nothing in the logs stood out. The search console quietly reported zero indexed pages for that host, and I read that as "too new" rather than "broken".

The cause was small. The sitemap route listed pages by reading a content directory with the filesystem API. On a normal server that is fine. On an edge worker the [filesystem is an in-memory virtual one](https://developers.cloudflare.com/workers/runtime-apis/nodejs/fs/) that does not contain the build's source tree, so the first real request found nothing to read and threw.

## The fix

Mark the route as static so the framework runs it once at build, where the source tree exists, and ships the result as a file. In Next.js the [route segment option `dynamic = 'force-static'`](https://nextjs.org/docs/app/guides/caching-without-cache-components) forces prerendering:

```ts
export const dynamic = 'force-static'
```

The sibling routes in the same app already did this. The sitemap was the one that had been written before the move to workers and never revisited.

## The lesson

- A build that passes proves the code compiles and prerenders what it was told to prerender. It says nothing about routes that run at request time.
- After any hosting move, fetch every generated file from production with a plain HTTP client: sitemap, robots, feeds, machine-readable indexes. Look at the status code, not just the body.
- Sitemaps are the common victim because nobody looks at them and search engines do not tell you loudly when they fail. A [sitemap is an XML file that lists a site's URLs](https://www.sitemaps.org/) for crawlers; a 500 where that file should be is silence, not an error you will see. Zero indexed pages is a symptom worth investigating on day one, not month three.
- Anything that enumerates content at request time (feeds, indexes, "all pages" endpoints) should be built at build time unless the content actually changes between deploys.

## Limits

One incident, one framework, one hosting platform. The mechanism will differ on other runtimes, and I did not capture the original stack trace; the diagnosis rests on the code path and on the fix removing the error.

Related: [[Growth gates before growth work]], where getting indexed is the second gate.
