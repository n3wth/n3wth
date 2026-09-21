# Newsletter subscriptions

The five site forms POST `{address, source}` to `https://n3wth.com/api/subscribe`.
Sources are `home`, `skills`, `garden`, `r3`, and `ui`. The shared helper lives in
`@n3wth/site-config/newsletter`. Success requires an active Resend contact, the
newsletter segment, and the selected topic subscription. Analytics runs only
after confirmed success and records source without an email address.

Production destinations are configured in `apps/portfolio/wrangler.jsonc`.
`RESEND_API_KEY` is a Worker and GitHub Actions secret. Never put it in a public
build variable. The newsletter segment is Agent infrastructure notes. Topics
are Portfolio, Skills, Garden, r3, and UI docs. Plex uses a separate topic and
segment through its Auth0 integration. No welcome email or broadcast is sent.

All topics default to opt_out. New contacts opt into only the selected topic.
Suppressions, global unsubscribe and existing topic opt_out are preserved.
Resend returns inherited and explicit opt_out identically; existing contacts
with either receive a neutral error and support contact rather than being
silently resubscribed. Existing active subscribers are safe to submit again.

Preview builds use the matching portfolio PR endpoint via
`VITE_SUBSCRIBE_ENDPOINT` for Portfolio/UI docs and
`NEXT_PUBLIC_SUBSCRIBE_ENDPOINT` for Skills/Garden/r3. The preview workflow also
deploys Portfolio when another site changes. Preview topics, segments and rate
limits are isolated. Production rejects preview origins. Local forms require
an explicit nonproduction endpoint; automated tests mock it.

Run `npm run check`, `npm run build:cloudflare`, and the preview browser checks
before release. CI runs the real form suite and the historical import tests.
The production workflow provisions the secret and deploys Portfolio before the
other sites. Confirm a controlled signup and Resend read-back before importing
historical data. See [historical import](resend-newsletter-import.md).

For rollback, prefer a fix that returns an honest unavailable error. Disable
submission by removing the newsletter secret if necessary, then deploy the
previous verified consumer versions. Do not roll back to analytics-only form
success or reactivate suppressed contacts. Keep provider records intact.
