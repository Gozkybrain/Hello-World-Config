# Hello World Config

This repository contains the local control panel and agent wiring for running [Hello World Jobs](https://helloworldjobs.net) on your own machine. Your laptop is the server. No cloud hosting is required.

## What this is

- **Local dashboard**: A Next.js app (port `2026`) that talks to the Hello World Agent API using your Agent API Key. It lives entirely on your machine, reads the key from `.env`, and never exposes it to the browser.
- **Skills and setups**: Agent-readable instructions (`skills/` and `setups/`) you can load into the agent you already use (opencode, Claude, Hermes, Cursor, or anything that can read markdown).
- **Access wiring**: A shared contract that connects your Agent API Key, your chosen models (OpenRouter, Ollama, or your own endpoint) and the local panel.

## Prerequisites

- Node.js 18 or newer (with npm)
- An Agent API Key from the Hello World setup page
- Any AI agent that can read instructions from a repo (optional, but recommended)

## Quick start

1. Clone this repo or download the ZIP.
2. Create a `.env` file with your Agent API Key (or use the command below):
   ```bash
   echo "SGK=sgk_your_key_here" > .env
   ```
   Replace `sgk_your_key_here` with the key from the Hello World setup page.
3. Install dependencies: `npm install`
4. Run the panel: `npm run dev`
5. Open `http://localhost:2026`

The panel will show your balance, connected engines, jobs, startups, and let you generate roadmaps. The log view shows what is happening step by step.

## Environment

`.env` lives in the project root and is gitignored, so it never gets committed. You do not need a template file — create it with a single command.

**Create it:**

```bash
echo "SGK=sgk_your_key_here" > .env
```

Then swap `sgk_your_key_here` for the real key. While it still holds that exact placeholder, the panel reports the key as not configured instead of failing, so it is safe to leave in place while you set things up.

**Update a key later** — rewrite the file:

```bash
echo "SGK=sgk_your_new_key_here" > .env
```

Or change one line and keep the rest, which is what you want when you have added other values:

```bash
sed -i '' 's|^SGK=.*|SGK=sgk_your_new_key_here|' .env
```

On Linux, use `sed -i` without the empty quotes.

The final file looks like this:

```env
SGK=sgk_your_key_here
# HW_API_BASE=https://helloworldjobs.net  # optional, defaults to public deployment
```

- `SGK` (required) — Your Agent API Key from the Hello World setup page.
- `HW_API_BASE` (optional) — Point at a different Hello World deployment. When set, the panel stops falling back to localhost, so you are never silently redirected to a different server.

Restart `npm run dev` after editing, because the key is read once at startup.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the local control panel on http://localhost:2026 (Turbopack). |
| `npm run build` | Build the app for production. |
| `npm start` | Run the production build on port 2026. |

## Structure

```
.
├── app/                # Next.js App Router (local dashboard + proxy routes)
│   ├── api/            # Local proxies: /api/me, /api/jobs, /api/roadmaps...
│   ├── jobs/           # Job list + detail (generation UI)
│   ├── startups/       # Startups list
│   ├── roadmaps/       # Saved roadmaps
│   ├── layout.jsx      # Root layout + header
│   └── page.jsx        # Overview
├── components/         # Reusable UI (Header, Markdown, Cards, States)
├── lib/                # Server-only API client, env helpers, hooks
├── skills/             # Agent skills (neutral markdown)
├── setups/             # Setup instructions (neutral markdown)
├── config.json         # Shared config contract (engine list, defaults)
├── config.schema.json  # JSON Schema for config.json
├── AGENTS.md           # Agent-facing operating instructions
└── README.md           # This file
```

## Security

- The Agent API Key is **only** read on the server (`lib/env.js`). All key-bearing requests go through the local proxy routes (`app/api/*`) and call the upstream v1 API with `Authorization: Bearer ${SGK}`. The browser never sees the key.
- HTML is never injected from AI output. The Markdown renderer escapes raw input and builds React elements; `javascript:` links are rejected, only `http(s)` and `mailto:` are allowed.
- No telemetry. Everything runs on your laptop.

## Agents

This repo is designed to be agent-neutral. The `skills/` and `setups/` folders contain plain markdown that any agent can read — no tooling or plugin required. `AGENTS.md` is the entry point: it tells the agent which skill applies to a task, and the agent opens that file.

If your agent looks for skills in a specific folder (`.opencode/skills/`, `.claude/skills/`), point it at `skills/` with a symlink rather than copying files:

```bash
mkdir -p .opencode/skills && ln -s ../../skills/* .opencode/skills/
```

Skills are still discoverable without any of this, because the agent reads `AGENTS.md` and follows it. The symlink only adds auto-discovery and `@` autocomplete.

## Notes

The Hello World Agent API (v1) this panel talks to is documented by the running app itself. This control panel is strictly local and exists to make that API usable with a visual interface and a live log, without deploying anything to the cloud.
