---
title: "Choose UI component ownership"
description: "A practical checklist for deciding where a UI component should live and who maintains it"
tags: [technology, engineering, design, development]
date: 2026-09-16
---

# Choose UI component ownership

Start by choosing where the source and fixes will live. Then ask how many products need the behavior. Consider how much change you expect. Name who will test an update.

## Use a shared package when

- Two or more applications need the same behavior, theme, or composition.
- A fix should have one home and reach every consumer through a package release.
- The package can expose a small, stable API instead of leaking application details.
- The package owner can test the component in its own package and in the affected applications.

This is the pattern in this workspace. Garden depends on `@n3wth/ui` in `apps/garden/package.json`. The UI package exposes native controls through `@n3wth/ui/primitives` and site compositions through `@n3wth/ui/site`. Garden's `TableOfContents` imports `ReadingOutline` from the site entry point. It does not import the underlying library directly.

## Keep the source local when

- Only one application needs the component.
- Its behavior is tightly coupled to one route, data shape, or product flow.
- The application needs deep changes that would make a shared API harder to understand.
- The team has named an owner for future fixes and updates.

Local source is not free. Write down whether fixes stay local or should later move into a shared package. Without that decision, two copies can drift and receive different accessibility fixes.

## Use an existing framework when

- The application already uses that framework and its component conventions.
- The component solves the interaction you need without forcing a second design system into the app.
- The framework's supported version, keyboard behavior, focus behavior, and labeling behavior fit the page.
- You can test the finished component in the real application, not only in an isolated example.

Do not treat a required prop or a type check as proof that the finished interface is accessible. Check names, roles, focus order, keyboard activation, contrast, announcements, and small-screen behavior in the page where the component runs.

## Name the maintenance constraint

Every ownership choice has a boundary. Here, `@n3wth/ui` owns the underlying component dependency in `packages/ui/package.json`. Garden does not own that dependency directly. Updating it is a UI-package change. It needs a package build and checks in consumers such as Garden. This gives the upgrade a clear owner.

## Assign fixes and checks

- Shared package owner: fixes the shared implementation, its exports, and package tests.
- Application owner: checks composition, content, layout, and route behavior where the component is used.
- Both owners: verify keyboard and screen-reader paths, visible focus, labels, contrast, and responsive behavior before release.

For this workspace, keep reusable behavior in `@n3wth/ui`. Keep Garden-specific headings, links, and placement in Garden. The [existing Kit component examples](https://kit.n3wth.com/components) show the public surface. The [current comparison](https://garden.n3wth.com/astryx-vs-shadcn-vs-angular-material) records the concrete reading-outline case.

The short rule is simple. Share behavior when fixes should be shared. Keep source local when the context is local. Use an existing framework when its ownership and checks fit the application.
