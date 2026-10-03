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

Automatic provisioning is deployed in image
`seerr-n3wth:oidc-newsletter-20260921`. The deterministic worker starts
10 seconds after startup and runs every five minutes. It selects existing,
verified Auth0 accounts from the deployed Seerr Action's canonical approval
list. The parser rejects unsupported list syntax without evaluating code.
Successful Plex sharing, an invitation, or a prior success receipt is required
before Resend sync and welcome delivery. Existing names are preserved and only
missing names are filled. Global and topic opt-outs are preserved.

The worker uses no LLM and does not depend on a Seerr login. The existing Seerr
Auth0 application retains authorization-code login and has an owner-approved
client-credentials grant scoped to exactly `read:users` and `read:actions`.
The old login welcome hook and standalone recovery process are removed.
Eligible provisioning ticks recover pending welcomes through the same durable
welcome receipts and idempotency keys.

On the Docker host, the worker is
`/home/onewth/docker/seerr/oidc-image/plex-provision.cjs`.
The enabled `plex-provision.json` and `plex-welcome.json` files live in
`/home/onewth/docker/seerr/config/`, owned by UID 1000 with mode 0600.
The first verified tick reported six approved entries, two verified accounts,
two provisioned accounts, zero welcomes, and zero failures. All seven campaign
recipients retained terminal receipts; no duplicate welcome was sent. The
container was healthy and the public settings endpoint returned HTTP 200.

## Plex weekly additions and request notifications

The approved weekly schedule is Friday at 17:00 in `America/Los_Angeles`,
starting September 25, 2026. Use that time zone so daylight saving changes do
not shift the local send time. The weekly message summarizes actual Plex
additions. Episodes are grouped by show, and empty categories are omitted.
At most six cards feature a balanced selection of movies and TV shows, with
accurate totals, dates, factual summaries, and genres. The poster grid has one
Open Plex action and a secondary request link.

Request notifications go to the requester when their requested content is
ready on Plex. The message has one Watch on Plex action that opens the item;
the poster is optional. Both messages use the Plex topic and signed unsubscribe
links for direct delivery.

Both templates and the notification runtime are active. A read-only
dry run found 14 episodes grouped into 12 shows,
four eligible contacts out of seven, and no historical request notifications.
This is validation evidence, not a delivery count.
Owner-only previews for both messages were delivered: weekly email
`01a0c24b-71e5-747a-8d11-137902fb53b9` and ready email
`01a0c24b-791c-7214-b6f6-cfed634dbc38`.

The weekly template requires `DATE_RANGE`, `INTRODUCTION`, `CONTENT_HTML`, and
`UNSUBSCRIBE_URL`. The ready notification requires `STATUS_TITLE`,
`CONTENT_TITLE`, `STATUS_MESSAGE`, `WATCH_URL`, and `UNSUBSCRIBE_URL`.
Its optional `POSTER_HTML` defaults to empty. Required values have no defaults;
populate them from the verified Plex data before sending.

Resend template variables are limited to 2,000 characters. The mailer fetches
the published template and deterministically renders the complete HTML and
subject before sending. Text is escaped; only the generated grid and poster
HTML are inserted as trusted markup. The durable receipt freezes the complete
HTML, headers, and topic so retries preserve the original message.

The deployed image is `seerr-n3wth:oidc-newsletter-20260921`, SHA
`b1800e0055e8eadf34e1e62af01af9f83d4d92ec26a3be8f4ba977c37ad9fec8`.
Configuration is `/home/onewth/docker/seerr/config/plex-newsletter.json`.
It polls every five minutes. The first weekly send is due September 25 at
17:00 Los Angeles time (September 26 at 00:00 UTC). Activation established a
fresh baseline while the service was stopped: zero completed requests, with
`enabledAt=1789966234859`. Historical completed requests are not announced.
The first scheduled tick found the weekly digest not due and zero ready
candidates; it sent no mail and created no receipts or weekly batches.
The container was healthy and the public settings endpoint returned HTTP 200.

Runtime sources and tests are preserved on the Docker host in
`/home/onewth/docker/seerr/automation-releases/newsletter-20260921`.
The rollback snapshot is `before-newsletter-20260921` in the same
`automation-releases` directory. Deployment validation passed 24 newsletter,
nine welcome, eight provisioning, and four approval-list parser checks.
To roll back, set the newsletter configuration's `enabled` field to `false`,
restore the prior Compose configuration, and recreate the service. Retain
newsletter receipts and `/config/plex-newsletter/request-baseline.json`.
The prior access-provisioning worker remains enabled.

## Signed unsubscribe links

Resend's reserved `RESEND_UNSUBSCRIBE_URL` applies to broadcasts and automations,
not direct template sends. Direct messages provide `UNSUBSCRIBE_URL` and
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
| Ready on Plex | f96d94d4-bd94-405e-aed6-dccab77e5a7e |

Sender: Oliver Newth `<hey@n3wth.com>`. Reply-to: `hey@n3wth.com`.
The n3wth.com sending domain is verified. The black email mark is
`https://r2.n3wth.com/mark-black.png`. Every list-triggered layout includes
`RESEND_UNSUBSCRIBE_URL` in its broadcast or automation footer. Direct messages
use the signed `UNSUBSCRIBE_URL` instead. Plex
layouts link to `https://app.plex.tv/desktop` and `https://seerr.n3wth.com/`.
The standard footer uses one line of small gray text with dot separators and
no underline: `n3wth`, `1333 Minna St San Francisco CA 94103`, then
`Unsubscribe` linked to the reserved
recipient-specific URL for broadcasts/automations, or the signed
`UNSUBSCRIBE_URL` for direct messages. It remains inside the main content column. Saved
templates contain no preview notice above the mark. The published templates
contain no empty paragraphs and use 16px of bottom spacing. Plex grids use one Open
Plex action below the grid and a secondary Request movies or TV link, rather
than repeated links under each cover. Industry digests use editorial imagery.
Complete each template's content variables before sending. Names are optional: public email-only signups
remain unnamed, while Auth0 fills missing Plex contact names from authenticated
given/family names and preserves existing names.

Templates do not select recipients or schedule delivery. Future broadcasts must
select the matching topic and intended segment. Three newsletter layouts remain
drafts; the website welcome, Plex welcome, weekly additions, and ready-on-Plex
templates are published.
Owner-requested sample emails are separate from audience sends. No audience
campaign or recurring digest is enabled by the website welcome integration.

For rollback, prefer a fix that returns an honest unavailable error. Disable
submission by removing the newsletter secret if necessary, then deploy the
previous verified consumer versions. Do not roll back to analytics-only form
success or reactivate suppressed contacts. Keep provider records intact.
