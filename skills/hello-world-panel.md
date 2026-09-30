---
name: hello-world-panel
description: Use when the user wants to browse Hello World jobs or startups, or generate a roadmap for a specific role from inside the local control panel at http://localhost:2026. Covers the four pages and how the local proxy maps to the Agent API.
---

# Working with the Hello World control panel

The control panel is local. It runs on the user's machine at `http://localhost:2026` and talks to the Hello World Agent API through Next.js proxy routes. The Agent API Key is read on the server from `.env` and never reaches the browser, so you do not need to handle the key directly.

## The four surfaces

- **Overview (`/`)** — Balance, roadmap count, and connected engines. If no engine is connected, it tells the user to connect one on the Hello World setup page.
- **Jobs (`/jobs`)** — Searchable, filterable, paginated list of live roles. Search matches role title, company, categories, and required skills.
- **Job detail (`/jobs/<job_id>`)** — Full role description, engine picker, and the Generate button with a live activity log.
- **Startups (`/startups`)** — Companies hiring now with open-role counts.
- **My Favourites (`/favourites`)** — Only the startups this key has paid for, in the same grid as `/startups`. One payment unlocks every role at that company.
- **Roadmaps (`/roadmaps`)** — Everything generated so far, collapsible, with Notion links where exported.

## Generating a roadmap

1. Open a job from `/jobs`.
2. Pick a model from the dropdown. It is populated from `GET /api/engines`, which reflects the engines the user connected on the setup page.
3. Optionally tick Export to Notion.
4. Press Generate.

The first run for a given role costs 25 cowrie tokens. Runs for a role the user has already paid for are free, and the button reads Regenerate in that case. The Activity log shows each step: job, engine, request, project count, guide status, model actually used, whether a fallback model was used, and total time.

## Things that go wrong

- **No Agent API Key configured** — the panel shows instructions to create `.env` with `SGK=sgk_...` and restart. This is a 401 with `code: "no_key"`.
- **Key rejected** — the user regenerated their key on the setup page but did not update `.env`. Update it and restart.
- **No engine connected** — generation is disabled. The user needs to connect OpenRouter, Ollama, or a custom endpoint on the setup page. `GET /api/v1/me/ai` reads engines from the server, not from the local config.
- **Nothing reachable** — if `HW_API_BASE` is set, the panel will not fall back to localhost. Unset it if the user wants the fallback.
- **Notion export failed** — the token is stored server-side against the user. The log reports the failure and generation still succeeds.

## API paths used by the panel

Local proxy (browser-facing) maps to upstream Agent API (key-bearing). Every upstream route carries the `/api/v1` prefix:

| Local | Upstream |
|---|---|
| `GET /api/me` | `GET /api/v1/me` |
| `GET /api/engines` | `GET /api/v1/me/ai` |
| `GET /api/jobs?key=` | `GET /api/v1/jobs?key=<job_id>` |
| `GET /api/jobs?limit=&page=&search=&type=` | `GET /api/v1/jobs` |
| `GET /api/startups?sort=&search=&limit=` | `GET /api/v1/startups` |
| `GET /api/startups?paid=1` | `GET /api/v1/startups?paid=1` (paid startups only) |
| `POST /api/roadmaps` | `POST /api/v1/roadmaps` |

If you extend the panel, add a proxy route and call through `lib/api.js` rather than fetching the upstream API from the browser. That is the only way to keep the key off the client.

To read the API directly instead of going through the panel, use the base resolution and curl recipe in `skills/wire-an-agent.md`. Do not hand-write endpoint paths from memory — the prefix is easy to get wrong.

## Reading AI output

Roadmap and application guide arrive as markdown. Render them with `components/Markdown.jsx`. Do not write your own HTML injection — model output is untrusted, and the bundled renderer escapes input, restricts link protocols, and converts `<aside>` blocks into callouts.
