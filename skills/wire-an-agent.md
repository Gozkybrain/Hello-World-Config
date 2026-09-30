---
name: wire-an-agent
description: Use when connecting an AI agent to Hello World for the first time, or when an agent reports that it has no API key, cannot reach the API, or needs to know how to authenticate. Covers the key contract, base resolution, and the neutral-markdown convention this repo follows.
---

# Wiring an agent to Hello World

## The key contract

One secret: the Agent API Key. It looks like `sgk_` followed by 64 hex characters. Users get it from the API Key card on the Hello World setup page and it is shown once.

Two rules:

1. Read it from the environment, never from source code. In this repo the variable is `SGK` and it lives in a gitignored `.env`.
2. Send it as `Authorization: Bearer $SGK`. The server resolves it to the user, updates last-used, and applies that user's balance, paid roles, and connected engines.

If a key is rejected, the user most likely regenerated it on the setup page. The old one stops working immediately.

## Choosing a base

Resolve the base before the first call and reuse it for the rest of the session. This is the same rule the CLI uses in `lib/config.js`.

1. If `HW_API_BASE` is set, use it alone. Do not fall back to anything else, or the agent will silently talk to a server the user did not choose.
2. Otherwise try these in order and keep the first one that answers `GET /api/v1/me`:
   - `https://helloworldjobs.net`
   - `http://localhost:3000`

Fall back only when the candidate is **unreachable** — a connection or DNS failure. A 401 or 403 means the server answered and the key is the problem, so stop and report that instead of trying the next base.

`https://helloworldjobs.net` is not live yet, so in practice the local base is the one that answers. `http://localhost:3000` is the real Hello World Jobs Next app, so it serves the same `/api/v1` routes, the same Firestore data, and the same auth as production. Start it with `npm run dev` in the `hello-world-jobs` directory if nothing is listening on port 3000.

Pin a base for a whole session with `HW_API_BASE=http://localhost:3000` to skip resolution entirely.

## Endpoints

Every route lives under the `/api/v1` prefix. Note the prefix — `/v1/me` is a 404.

| Route | Purpose |
|---|---|
| `GET /api/v1/me` | Profile, balance, applications, saved roadmaps, and the user's 6-digit `code`. The cheapest call that proves both the base and the key. |
| `GET /api/v1/jobs?limit=&page=&search=&type=` | Paginated job list |
| `GET /api/v1/jobs?key=<job_id>` | One job. The parameter is named `key` but it takes the **`job_id`** value, not the `key` field from a list response — in a list, `key` is the company slug and is shared by every role at that company. |
| `GET /api/v1/startups?sort=&search=&limit=` | Active startups. `sort` accepts `new` or anything else, which reshuffles randomly on every call. `limit` is clamped to 50 and there is no offset, so paging means raising `limit`. |
| `GET /api/v1/me/ai` | Connected engines and their models |
| `POST /api/v1/roadmaps` | Generate a roadmap. Costs 25 cowrie tokens unless the role is already paid. |

## Talking to it

```bash
BASE=http://localhost:3000        # or https://helloworldjobs.net
set -a && . ./.env && set +a     # loads SGK without printing it

curl -sS -H "Authorization: Bearer $SGK" "$BASE/api/v1/me"
curl -sS -H "Authorization: Bearer $SGK" "$BASE/api/v1/jobs?limit=5&search=frontend"
curl -sS -H "Authorization: Bearer $SGK" "$BASE/api/v1/jobs?key=<job_id>"
```

Never echo, print, log, or commit `$SGK`. Read it from the environment, reference it as `$SGK`, and redact it if a command fails in a way that would echo the request headers. `.env` is gitignored and must stay that way.

## Models belong to the user

`GET /api/v1/me/ai` returns the engines the user connected, each with a base and a model list. Respect that list. Users bring their own models, and some run entirely locally through Ollama. Never hardcode a provider or assume a key the user has not set up.

If the list is empty, the fix is to connect an engine on the setup page, not to add a fallback provider in code.

## Adding agent instructions to this repo

The convention here is neutral markdown plus one agent folder.

- Put anything tool-agnostic in `skills/` or `setups/` as markdown with YAML frontmatter carrying `name` and `description`. The description is what an agent reads to decide whether the skill applies, so write it as a trigger list, not a summary.
- Do not duplicate the same instructions across `.claude/`, `.cursor/`, and friends. If one agent needs something special, add that agent's folder and keep the shared copy in `skills/`.
- Keep the API paths and failure modes in one place. Duplicated endpoint tables drift.

## Boundaries

- The key must never be sent to the browser. In this repo the key is read in `lib/env.js` and used only by server routes.
- Model output is untrusted. Render markdown through the escape-first renderer rather than setting innerHTML yourself.
- Cowrie tokens are real balance. Check the cost model before triggering a paid run, and tell the user when a run is free because the role is already paid.
