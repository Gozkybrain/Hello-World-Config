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

Default to `https://helloworldjobs.net`. Set `HW_API_BASE` only when the user runs their own deployment. When that variable is set, do not fall back to any other base, or the agent will silently talk to a server the user did not choose.

## Models belong to the user

`GET /v1/me/ai` returns the engines the user connected, each with a base and a model list. Respect that list. Users bring their own models, and some run entirely locally through Ollama. Never hardcode a provider or assume a key the user has not set up.

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
