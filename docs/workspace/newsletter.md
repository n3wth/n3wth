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
segment through its Auth0 integration. New production website contacts receive
one introductory welcome after their selected subscription is confirmed.
Existing contacts and historical imports do not receive a welcome.

All topics default to opt_out. New contacts opt into only the selected topic.
Suppressions, global unsubscribe and existing topic opt_out are preserved.
Resend returns inherited and explicit opt_out identically; existing contacts
with either receive a neutral error and support contact rather than being
silently resubscribed. Existing active subscribers are safe to submit again.

The shared signup label is: “Notes and new work across design, technology, AI,
and the things I’m exploring.” Topic choice still follows the source site.

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

r3 and UI docs are retired sites served by Cloudflare redirects. Their source
forms remain tested, and their topics are available for project updates, but
they are not separate live signup consumers. Portfolio, Garden and Skills are
the three active signup sites. See [retired sites](retired-sites.md).

## New subscriber welcome

The website welcome uses published template
`68d8d7db-2025-41cf-94e0-31bd07537b19` (`website-welcome`), sent directly through
Resend with the selected `topic_id`. This is deterministic application behavior;
it does not use an LLM, campaign, or recurring automation. Only production
signups can mark contacts for this delivery; previews never send welcomes.

New contacts receive `website_signup_source`, `website_welcome_status=pending`,
and `website_welcome_started_at` string properties during contact creation.
Once active contact, segment, and topic membership are verified, Worker
`waitUntil` gives delivery a separate 15-second budget without delaying signup
success. Delivery makes at most two attempts, with bounded account-rate retries.
The stable `website-welcome-v1/{contactId}` idempotency key prevents concurrent
or uncertain retries from sending duplicate messages. Accepted deliveries store
`website_welcome_status=sent` and `website_welcome_email_id`.

Failed delivery leaves the pending marker for a later signup retry. Automatic
retry stops 23 hours after the first marker, before Resend's 24-hour idempotency
window expires. Do not clear or reset an old pending marker blindly: inspect
Resend delivery records first. Signup success does not prove email delivery;
verify the saved email ID and provider status separately. Operational warnings
record source and failure category without addresses or signing tokens.

`RESEND_WELCOME_TEMPLATE_ID` and `RESEND_WELCOME_FROM` are public Worker config.
`RESEND_UNSUBSCRIBE_SECRET` is a Worker/GitHub secret, also saved as
`Resend welcome unsubscribe signing` in the `Shared with Agents` vault.
The production workflow provisions it alongside the Resend API key. Disabling
the welcome template binding stops new welcome sends without stopping signups.

## Plex welcome and access provisioning

Plex welcomes follow approved Plex access, independently of whether someone
has signed into Seerr. The previous first-login welcome sender is disabled.
The published Plex welcome template is
`8b0bab4f-0371-4f37-a06e-40f75a052ed5`.

The owner-authorized welcome broadcast to the seven current Plex contacts is
complete. Broadcast `8aa26080-b564-4db9-a425-be8bf45ea405` reports seven delivered,
zero bounced, and zero suppressed. The owner's received message was also
verified, with subject “Welcome to the new Plex”. All seven contacts have
terminal welcome receipts so later provisioning does not send another intro.
Do not clear those receipts or repeat the broadcast to introduce the new worker.

Future welcome provisioning is being implemented and is not yet deployed.
The approved design is a deterministic local worker running every five minutes.
It selects verified Auth0 accounts from the deployed Seerr approval list,
provisions Plex access, preserves existing Resend names and opt-outs, and sends
through the durable welcome-receipt helper after access is ready. It uses no
LLM and does not depend on a Seerr login. Its Auth0 machine credential is scoped
to `read:users` and `read:actions`; credential setup and deployment verification
must finish before automatic future welcomes can be reported as active.
The tenant's application limit blocks creating a separate machine client.
Using the existing Seerr application for the machine grant is pending owner
authorization; the worker remains disabled until that grant is configured.

## Signed unsubscribe links

Resend's reserved `RESEND_UNSUBSCRIBE_URL` applies to broadcasts and automations,
not direct template sends. Direct welcomes provide `UNSUBSCRIBE_URL` and
RFC 8058 `List-Unsubscribe` / `List-Unsubscribe-Post` headers instead.
The URL is `/api/unsubscribe?token=...`; its HMAC-SHA256 signature covers an
opaque contact ID and one configured topic ID, never an email address.

GET displays an inert confirmation so email scanners cannot unsubscribe users.
POST verifies the signature and opts out only that topic. Other topics and
global subscription state remain unchanged. The endpoint accepts the configured
website topics and the Plex topic. Keep the signing secret stable so links in
previous messages continue to work.

## Message templates

The six subscription topics are separate from the message layouts. These editable
templates share the black Newth mark and an unsubscribe footer inside the main
content column:

| Newsletter | Template ID |
| --- | --- |
| n3wth updates | b086e967-6929-40b6-b813-7bc787f7e010 |
| Product release | acaceaca-9005-483e-a3d1-16e3008ab761 |
| Industry news digest | 690d112b-a1eb-4523-b316-b6eba4800365 |
| Plex welcome | 8b0bab4f-0371-4f37-a06e-40f75a052ed5 |
| Plex weekly additions | e0618918-49f2-4868-8b66-31e3be4ff049 |
| Seerr notification | f96d94d4-bd94-405e-aed6-dccab77e5a7e |

Sender: Oliver Newth `<hey@n3wth.com>`. Reply-to: `hey@n3wth.com`.
The n3wth.com sending domain is verified. The black email mark is
`https://r2.n3wth.com/mark-black.png`. Every list-triggered layout includes
`RESEND_UNSUBSCRIBE_URL` in its broadcast or automation footer. Direct welcomes
use the signed `UNSUBSCRIBE_URL` instead. Plex
layouts link to `https://app.plex.tv/desktop` and `https://seerr.n3wth.com/`.
The standard footer uses small, left-aligned text with no divider: `n3wth`,
`1333 Minna St San Francisco CA 94103`, then `Unsubscribe` linked to the reserved
recipient-specific URL for broadcasts/automations, or the signed
`UNSUBSCRIBE_URL` for direct welcomes. It remains inside the main content column. Saved
templates contain no preview notice above the mark. Plex grids use one Open
Plex action below the grid and a secondary Request movies or TV link, rather
than repeated links under each cover. Industry digests use editorial imagery.
Complete each template's content variables before sending. Names are optional: public email-only signups
remain unnamed, while Auth0 fills missing Plex contact names from authenticated
given/family names and preserves existing names.

Templates do not select recipients or schedule delivery. Future broadcasts must
select the matching topic and intended segment. Newsletter layouts remain drafts
unless explicitly published; automatic welcomes use their published template.
Owner-requested sample emails are separate from audience sends. No audience
campaign or recurring digest is enabled by the website welcome integration.

For rollback, prefer a fix that returns an honest unavailable error. Disable
submission by removing the newsletter secret if necessary, then deploy the
previous verified consumer versions. Do not roll back to analytics-only form
success or reactivate suppressed contacts. Keep provider records intact.
