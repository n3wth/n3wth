---
title: "One live region per page"
description: "A status message in a shared footer turned every page into a page with two live regions. Render live regions only when they have something to say."
tags: [accessibility, frontend, design-systems, testing]
date: 2026-09-18
stage: seedling
---

# One live region per page

I added a small email form to the footer that every one of my sites shares. Under the form sat a paragraph with `role="status"`, empty until the reader submits, so screen readers would announce "Thanks, you are on the list" when it changed. Textbook.

Then a browser test on an unrelated tutorial page failed. The tutorial has its own status line that counts button presses. The test asked for the page's status element and found two.

## What was actually wrong

The test was the canary, but the smell was real. A live region is a promise to assistive technology: "watch this spot, announce what changes here." An empty live region on every page of every site is a promise with nothing behind it, and it dilutes the one that matters on the pages that have one.

## The fix

Render the live region only when it has content:

```tsx
<div className="status-slot">
  {status === 'done' && <p role="status">{successMessage}</p>}
  {status === 'error' && <p role="status">{errorMessage}</p>}
</div>
```

The wrapper keeps its height so the layout does not jump. Elements inserted with `role="status"` and content already present are announced by current browsers and screen readers, so nothing is lost.

## The general rule for shared chrome

Anything that lives in a shared header or footer is on every page. Landmarks, live regions, headings, and skip links there are not local decisions. Before adding one, ask what it does to a page that already has its own. Strict test locators that refuse to pick between two matches are a cheap way to find out.

Related: [[Growth gates before growth work]], the reason the form exists at all.
