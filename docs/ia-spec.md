# n3wth.com IA spec

Baseline: `origin/main` e24e01d, 2026-09-01. Nav: n3wth, Work, Art, Thinking, Library, Contact. Nothing here is deployed. The 3D hero (`src/components/NightField.tsx`) is out of scope.

## 1. What each nav item is for

| Nav | Path | Who it is for | What a page must earn to live here |
|---|---|---|---|
| n3wth | `/` | Someone who arrived from a search or a handshake and needs, in ten seconds, who Oliver is and where to go. | The one page allowed to be a scene. Nothing lives here that is not a door to the other five. Must render an `h1` whether or not WebGL loads. |
| Work | `/work` | A hiring manager, founder, or collaborator deciding whether to write. | An employer or a product with a live URL, a city, and a date. Survives the question "what did you ship?" |
| Art | `/art` | Curators, fabricators, and people who stood in front of the piece. | Built, sited, dated, credited. Black Rock City, Twin Peaks, the Grove. Sketches and renders do not qualify. |
| Thinking | `/thinking` | Practitioners building with agents who want a position they can argue with. | One claim, drawn from something Oliver built, that would still be worth reading if this site vanished. |
| Library | `/library` | An engineer who wants to install something tonight. | Every shelf resolves to a command, a package, or a registry. No target, no shelf: it goes to Work or Thinking. |
| Contact | `/contact` | A person who has already decided to write. | Earns nothing. Asks one thing: pick the right inbox. It carries every route, so no other page needs an address. |

Utility routes stay but never enter nav, sitemap, or llms.txt: `/login`, `/logout`, `/error` (Auth0 for auth.n3wth.com), `/privacy`, `/terms`, `/consent`, `/404`.

## 2. Kill list

Costume

- "After dark" as the Art page title and llms.txt label. Nav says Art. One name.
- "I build things that glow" (Art h1). Replace with the places: "Light for Black Rock City and San Francisco".
- "Help yourself" (Library h1). Replace with "Library".
- "Let's talk" (Contact h1). Replace with "Contact".
- "The next system is already on the bench." and "The next one is already sketched." (Work and Art codas). Cut. A page ends when the content ends.
- "What building this **actually** taught me" (Thinking h1). Drop "actually".
- "Need a hand with something I built?" and "went sideways" (Support). Page dies, see 301s.
- Hardcoded counts in copy: "248 notes" (Library meta, llms.txt; snapshot says 252), "49 components", "Five live products". Read from the build snapshot or drop the number.

Duplicate

- Three personal addresses in circulation: `hey@n3wth.com` (siteConfig, llms.txt), `oliver@newth.ai` (privacy/terms/consent html, index.html comment, prerender-meta, agent.ts), `support@n3wth.com` (Support). One printed personal address. See 4.
- `/support` and `/contact` are two pages that both say "email me". Merge into `/contact`.
- Garden appears in the mobile nav sheet only, on the home page as "The garden", in the footer ecosystem strip, and on a Library shelf. Keep footer and Library. Drop it from nav and from the home doors.
- Three of 21 essays narrate agents building this site: `this-page`, `compound-engineering`, `night-field`. Merge `this-page` into `compound-engineering`. `night-field` stays; it is about the hero, not the process.
- "Ships with a standing agent team" / "shipped by an autonomous agent team" / "my agent team keeps them shipping" appears in siteConfig.description, the Work lede, llms.txt, index.html, and prerender-meta. Say it once, in `/thinking/agent-desks`. Everywhere else: "Five products, all live."
- Sitemap: the working tree lists 6 URLs, production lists 29. Generate it from the essay registry; never hand-edit.
- Trailing slashes: sitemap.xml and llms.txt say `/work/`; vercel.json says `trailingSlash: false`. Fix the two files, not the router.

Claude-demo

- `api/agent.ts`. A Gemini/OpenRouter chat endpoint nothing in `src/` calls, with a system prompt that publishes "Married to Edward", "Corona Heights", and internal request volumes. Delete the function and the Vercel route.
- Command palette "AI search with streaming" (`CommandPalette.tsx:336`). ⌘K is a page and note finder. If it answers questions, it is a chatbot in a trench coat. Keep the finder, drop the answer mode.
- `claudedocs/PROJECT_INDEX.md` describes the June single-page site and cites a grosvenornewth comparison. Delete.

## 3. Contact routing

One page, four rows, no form, no calendar link. Footer keeps GitHub and LinkedIn.

| Row on /contact | Who | Address | Printed |
|---|---|---|---|
| hop | hop.flights account, billing, a verdict that looks wrong | link to hop.flights/support (inbox support@hop.flights, has its own ingest pipeline) | link only, not the address |
| Something I built broke | theywontshutup.com hotline, n3wth.com, kit, r3, skills | support@n3wth.com | yes |
| Oliver | coffee in San Francisco, art, collaboration, press about Oliver | hey@n3wth.com | yes |
| Google | DeepMind platform work, speaking as a Googler, colleagues and partners. Not recruiting. | newth@google.com | yes, one line |
| Edward | calendar invites only | his grosvenornewth.com address, on file | never. Not on any page, llms.txt, JSON-LD, endpoint, or this repo. |

Assumption: `hey@n3wth.com` delivers. If it does not, print `oliver@newth.ai` on the Oliver row and change nothing else. Both addresses keep receiving; only one is ever printed.

`/support` was the URL registered with Auth0 (logout, error pages), the command palette, and possibly Twilio toll-free verification for the hotline. The 301 keeps those links live. Update the three in-repo references when the redirect ships.

## 4. 301 map

Rules. Prefer the longer obvious slug over the cute one. Rename an essay slug only when the slug and the title disagree. Hash anchors from the June single-page site never reach the server, so they get a client-side map on `/`, not a 301. here.n3wth.com is a here.now host: each listing review keeps its long word-word-word slug, is never linked from n3wth.com, never enters a sitemap, and never gets a `/listings` index. The here.n3wth.com root keeps forwarding to n3wth.com.

| Old | New | Kind | Why |
|---|---|---|---|
| `/support` | `/contact` | 301 | merged |
| `/blog`, `/news`, `/press` | `/thinking` | 301 | already in vercel.json, keep |
| `/writing`, `/essays`, `/posts` | `/thinking` | 301 | defensive, no inbound evidence |
| `/projects`, `/building`, `/experience`, `/resume`, `/cv`, `/about` | `/work` | 301 | defensive |
| `/creative`, `/installations` | `/art` | 301 | old section name was "creative" |
| `/thinking/this-page` | `/thinking/compound-engineering` | 301 | merged |
| `/thinking/gtd-mini` | `/thinking/agent-runs-my-todo-list` | 301 | cute slug |
| `/thinking/pdf-charspace` | `/thinking/pdf-text-extraction-charspace` | 301 | jargon slug |
| `/thinking/2026-goals` | `/thinking/working-notes-2026` | 301 | slug says goals, title says notes |
| `/thinking/twilio-compliance` | `/thinking/twilio-toll-free-verification` | 301 | title is the verification maze |
| `/thinking/llm-inference` | `/thinking/llm-inference-memory-bound` | 301 | title is the memory claim |
| `/thinking/trust-production` | `/thinking/trust-runtime-property` | 301 | reads as "trust production" |
| `/work/`, `/art/`, `/thinking/`, `/library/`, `/contact/` | same without slash | Vercel default 308 | fix sitemap and llms.txt instead |
| `newth.ai/*` | `n3wth.com/*` | domain 308, exists | keep |
| `hop.n3wth.com/*` | `hop.flights/*` | domain redirect, exists | keep, path-preserving |
| `here.n3wth.com/` | `n3wth.com/` | here.now meta refresh, exists | keep |
| `here.n3wth.com/<word-word-word>` | unchanged | none | guest review pages stay unguessable |
| `/#work`, `/#building` | `/work` | client hash map | June anchors |
| `/#creative` | `/art` | client hash map | June anchors |
| `/#thinking`, `/#ai-explainer`, `/#frameworks` | `/thinking` | client hash map | June anchors |
| `/#contact` | `/contact` | client hash map | June anchors |

Unchanged slugs: `night-field`, `agents-org-design`, `ambient-ai`, `ai-design-slop`, `live-artifacts`, `personal-knowledge-graph`, `home-automation`, `compound-engineering`, `autonomous-agents`, `edge-typescript`, `hop-flights`, `kroots-map`, `agent-desks`, `field-guide`.

## 5. Type and voice

Satoshi Medium for display, Geist Medium for body and nav, Geist Mono only for machine output. True black ground. Heaviest weight 600. Places over adjectives: Black Rock City, Twin Peaks, AIDS Memorial Grove, San Francisco. No sludge: no "actually", "seamless", "world-class", "delightful", "beautiful".
