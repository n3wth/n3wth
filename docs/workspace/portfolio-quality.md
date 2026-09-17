# Portfolio quality checks

## Scope

The portfolio keeps its existing scene, navigation, and contact options. Route content and the footer share one loading boundary. This prevents the footer from moving when a lazy route loads. Anchor scrolling runs after the route content mounts.

The loading state keeps the main landmark and the navigation available. It announces that the page is loading.

## Action events

Events use the existing deferred PostHog instance through `apps/portfolio/src/lib/analytics.ts`. Do not add another SDK initialization.

| Event | Custom properties | Meaning |
| --- | --- | --- |
| `contact_intent` | `source_page: '/contact'`, `method: 'email'`, `'linkedin'`, or `'copy'` | A visitor selected a contact action. |
| `contact_copy_succeeded` | `source_page: '/contact'`, `method: 'copy'` | The clipboard write completed. |
| `contact_copy_failed` | `source_page: '/contact'`, `method: 'copy'` | The clipboard write failed. |
| `home_projects_clicked` | `source_page: '/'` | A visitor selected the existing project link. |
| `not_found_viewed` | `source_page: '/404'` | A missing-page navigation displayed the recovery page. |
| `not_found_recovery_clicked` | `source_page: '/404'`, `destination: 'home'`, `'work'`, or `'contact'` | A visitor selected a recovery destination. |

An email click does not prove that an email was sent. A successful copy does not prove that a conversation started. The missing-page view guard prevents duplicate events from React StrictMode effect replay.

Custom properties contain fixed action identifiers. Do not add email addresses, message content, clipboard content, exception text, or arbitrary missing URLs. Existing SDK page properties follow the current project configuration.

## Validation and release

1. Run `npm run check` from the repository root.
2. Run `AFFECTED_WORKSPACES='["@n3wth/portfolio"]' npm run check:browser`.
3. Check the Preview deployment at mobile and desktop widths. The portfolio currently uses the dark theme.
4. Check cold route loads, keyboard recovery links, project anchors, normal navigation, and browser Back.
5. Check the new action events before using them in an analysis. Local browser tests block analytics requests.
6. Confirm the deployed version and environment. Follow `docs/workspace/deployment.md` before a production release.

After release, inspect layout movement on Work, Art, Thinking, Library, and Contact. Use p75 CLS with the sample count. The target is 0.1 or lower. Check mobile results separately.

Use a session-based, ordered funnel for Home, the project action, and the Work page. Measure contact intent separately. Count successful copy outcomes separately from copy attempts.

Measure recovery actions after missing-page views. Do not combine missing-page events with sign-in errors.

Compare equal reporting periods after sufficient data arrives. Do not claim that a before-and-after difference proves cause. No feature flag, survey, or recording setting changes are part of this patch.
