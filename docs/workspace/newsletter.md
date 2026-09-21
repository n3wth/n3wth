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

r3 and UI docs are retired sites served by Cloudflare redirects. Their source
forms remain tested, and their topics are available for project updates, but
they are not separate live signup consumers. Portfolio, Garden and Skills are
the three active signup sites. See [retired sites](retired-sites.md).

## Draft newsletter templates

The six subscription topics are separate from the message layouts. Six editable
drafts share the black Newth mark and an unsubscribe footer inside the main
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
`RESEND_UNSUBSCRIBE_URL` in its footer, including Plex notifications. Plex
layouts link to `https://app.plex.tv/desktop` and `https://seerr.n3wth.com/`.
Complete each template's content variables and the marketing mailing-address
placeholder before sending. Names are optional: public email-only signups
remain unnamed, while Auth0 fills missing Plex contact names from authenticated
given/family names and preserves existing names.

Templates do not select recipients or schedule delivery. Future broadcasts must
select the matching topic and intended segment. Drafts remain unpublished;
owner-requested sample emails are separate from audience sends. No audience
campaign or recurring digest has been enabled. Welcome messages must exclude
existing contacts and historical imports if automatic sending is enabled later.

For rollback, prefer a fix that returns an honest unavailable error. Disable
submission by removing the newsletter secret if necessary, then deploy the
previous verified consumer versions. Do not roll back to analytics-only form
success or reactivate suppressed contacts. Keep provider records intact.
