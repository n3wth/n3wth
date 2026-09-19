---
title: "One live region per page"
description: "A status message in a shared footer turned every page into a page with two live regions. Render live regions only when they have something to say."
tags: [accessibility, frontend, design-systems, testing]
date: 2026-09-18
stage: seedling
---

# One live region per page

I added a small email form to the footer that every one of my sites shares. Under the form sat a paragraph with `role="status"`, empty until the reader submits, so screen readers would announce "Thanks, you are on the list" when it changed. The [status role](https://www.w3.org/TR/wai-aria-1.2/#status) is a live region with an implicit polite politeness, made for exactly this. Textbook.

Then a browser test on an unrelated tutorial page failed. The tutorial has its own status line that counts button presses. The test asked for the page's status element and found two. [Playwright locators are strict](https://playwright.dev/docs/locators#strictness): an operation that resolves to more than one element throws.

## What was actually wrong

The test was the canary, but the smell was real. A live region is a promise to assistive technology: "watch this spot, announce what changes here." An empty live region on every page of every site is a promise with nothing behind it, and it dilutes the one that matters on the pages that have one.

## The fix

My first instinct was to render the status element only when it had a message. The [guidance on live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) points the other way: establish the region before updating its content, because assistive technology announces changes, not arrivals. So the region stays in the page. What changes is its role.

```tsx
<p aria-live="polite" className="status-slot">
  {status === 'done' ? successMessage : status === 'error' ? errorMessage : null}
</p>
```

A plain polite live region announces the footer's own message when it appears. It does not carry the `status` role, so the tutorial's status element is again the only one on the page, and the strict locator is satisfied for the right reason.

## The general rule for shared chrome

Anything that lives in a shared header or footer is on every page. Landmarks, live regions, headings, and skip links there are not local decisions. Before adding one, ask what it does to a page that already has its own. Strict test locators that refuse to pick between two matches are a cheap way to find out.

## Limits

I verified the fix against the test and the specification text, not against a screen reader session. Announcement behaviour varies by browser and assistive technology pairing.

Related: [[Growth gates before growth work]], the reason the form exists at all.
