---
name: canvas
description: Create a shareable interactive markdown canvas and return https://canvas.n3wth.com/c/{slug}. Use when humans or other agents should open the rendered output by URL.
---

# Canvas

`canvas.n3wth.com` holds interactive markdown plus a rendered preview, keyed by a public slug. Open views on the share URL update when source is written.

This skill talks to the authenticated HTTP agent API. No browser. No secrets in this file — the caller supplies `CANVAS_AGENT_TOKEN` and the Convex site base URL from its own env.

## When to use

- Spin up a cowork surface another human or agent can open
- Push markdown and hand back a stable link
- Update an existing canvas in place so open tabs re-render
- Read current source before editing

## Env the caller must have

| Variable | Meaning |
| --- | --- |
| `CANVAS_SITE_URL` | Convex HTTP base, e.g. `https://.convex.site` (no trailing slash) |
| `CANVAS_AGENT_TOKEN` | Shared bearer token, when the deployment has one configured |

Public share links always use `https://canvas.n3wth.com/c/{slug}` (not the Convex site host).

**Auth:** If `CANVAS_AGENT_TOKEN` is set on the Convex deployment, every agent route below requires `Authorization: Bearer $CANVAS_AGENT_TOKEN`. If the token is unset (local/dev), the same routes work without a header — set the token in production.

## API

Auth on every mutating/read agent route:

```http
Authorization: Bearer $CANVAS_AGENT_TOKEN
Content-Type: application/json
```

Discovery (no auth):

```bash
curl -sS "$CANVAS_SITE_URL/agent/v1"
```

### 1. Create

```bash
curl -sS -X POST "$CANVAS_SITE_URL/agent/v1/canvases" \
  -H "Authorization: Bearer $CANVAS_AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My canvas",
    "source": "# Hello\n\nThis is **markdown**."
  }'
```

Response includes `slug`, `url`, `version`. **Return `url` to the user** — that is the canvas to open at `https://canvas.n3wth.com/c/{slug}`.

### 2. Write source

```bash
curl -sS -X PUT "$CANVAS_SITE_URL/agent/v1/canvases/$SLUG/source" \
  -H "Authorization: Bearer $CANVAS_AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":"# Updated\n\nNew content here."}'
```

Open tabs on `https://canvas.n3wth.com/c/$SLUG` re-render without reload.

### 3. Read current source

```bash
curl -sS "$CANVAS_SITE_URL/agent/v1/canvases/$SLUG" \
  -H "Authorization: Bearer $CANVAS_AGENT_TOKEN"
```

### 4. List

```bash
curl -sS "$CANVAS_SITE_URL/agent/v1/canvases" \
  -H "Authorization: Bearer $CANVAS_AGENT_TOKEN"
```

Returns metadata only (no source bodies).

## Agent workflow

1. Confirm `CANVAS_SITE_URL` and `CANVAS_AGENT_TOKEN` are set in your environment (never commit them).
2. `POST /agent/v1/canvases` with optional `title`/`source`.
3. Tell the human/other agent the `url` from the response (`https://canvas.n3wth.com/c/{slug}`).
4. Iterate with `PUT .../source` as you refine.
5. `GET .../canvases/{slug}` if you need the current source before editing.

## Errors

| Status | Meaning |
| --- | --- |
| 401 | Missing/wrong bearer token (only when the deployment has `CANVAS_AGENT_TOKEN` set) |
| 404 | Unknown slug |
| 400 | Validation (source size, JSON) |

Source hard limit: 512 KiB characters.

## Out of scope

No drawing whiteboard, no third-party canvas products. This API is create / write source / read / list only.

## Portable install

Copy this folder into `skills.n3wth.com` or any household agent skills root as `canvas/SKILL.md`. Point agents at it from `AGENTS.md`. Contact: hey@n3wth.com. GitHub: https://github.com/n3wth.
