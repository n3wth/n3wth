---
title: "Static routes on serverless workers"
description: "A route handler that reads the filesystem at request time will build fine and fail in production on edge workers. Prerender it."
tags: [engineering, nextjs, cloudflare, seo]
date: 2026-09-18
stage: seedling
---

# Static routes on serverless workers

A sitemap on one of my sites returned an internal server error for months. The build passed every time. Nothing in the logs stood out. The search console quietly reported zero indexed pages for that host, and I read that as "too new" rather than "broken".

The cause was small. The sitemap route listed pages by reading a content directory with the filesystem API. On a normal server that is fine. On an edge worker there is no filesystem at request time, so the first real request threw.

## The fix

Mark the route as static so the framework runs it once at build, where the filesystem exists, and ships the result as a file:

```ts
export const dynamic = 'force-static'
```

The sibling routes in the same app already did this. The sitemap was the one that had been written before the move to workers and never revisited.

## The lesson

- A build that passes proves the code compiles and prerenders what it was told to prerender. It says nothing about routes that run at request time.
- After any hosting move, fetch every generated file from production with a plain HTTP client: sitemap, robots, feeds, machine-readable indexes. Look at the status code, not just the body.
- Sitemaps are the common victim because nobody looks at them and search engines do not tell you loudly when they fail. Zero indexed pages is a symptom worth investigating on day one, not month three.
- Anything that enumerates content at request time (feeds, indexes, "all pages" endpoints) should be built at build time unless the content actually changes between deploys.

Related: [[Growth gates before growth work]], where getting indexed is the second gate.
