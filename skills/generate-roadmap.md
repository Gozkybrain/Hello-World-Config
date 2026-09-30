---
name: generate-roadmap
description: Use when a user asks for a career roadmap, proof-of-work project ideas, or an application or DM strategy for a specific job or startup. Triggers on "roadmap for", "projects for this role", "how do I apply", "stalker strategy", "proof of work". Covers the cost model, engine selection, and how to read the response.
---

# Generating a Hello World roadmap

A roadmap is one API call that returns three things: a scaffold of the job, project ideas, and an application guide. The API does the AI work on a connected engine, so you do not call a model yourself.

## The call

`POST /api/v1/roadmaps` with:

```json
{ "jobId": "<job_id>", "model": "<model>", "exportToNotion": false }
```

- `jobId` is required. Get it from `GET /api/v1/jobs` or `GET /api/v1/jobs?key=<job_id>`.
- `model` is optional. Omit it to let the server pick. To choose explicitly, read `GET /api/v1/me/ai` first and use a model from a connected engine.
- `exportToNotion` defaults to false. It needs the user's Notion token, which is stored server-side.

Authorize with `Authorization: Bearer $SGK`. If you are working inside the control panel, use the local `POST /api/roadmaps` proxy instead so you never touch the key.

## Cost

The first run for a given role costs 25 cowrie tokens. Subsequent runs for the same role are free. The response includes `usedModel` and `fallback` so you can tell the user what actually happened. If payment fails you get a 400 and nothing is generated, so surface that rather than retrying blindly.

## What comes back

- `roadmap` — a markdown scaffold with sections: Job Details and Description, Project Info, Proof of Work, Application Guide.
- `projects` — an array of project ideas, each with `name`, `why`, `skills`, and `recommended`.
- `applicationGuide` — markdown, usually a 7 to 10 day strategy. ChatGPT prompt blocks are wrapped in `<aside>` tags; render those as callouts.
- `usedModel`, `fallback` — which model served the request.
- `notionUrl`, `notionError` — present when you asked for a Notion export.

## Choosing an engine

`GET /api/v1/me/ai` returns the engines the user has connected, each with a `models` list. Prefer what they have actually connected. If they have none, tell them to connect one on the setup page rather than guessing a provider.

## Writing the output for a human

- Lead with the recommended project. It is the one with the strongest signal for this specific role.
- Keep the application's DM templates intact. Users paste them directly into chat apps, so reformatting them breaks the flow. Render `<aside>` content as a copyable callout.
- Do not add emojis. The prompts ask the model for plain output and the user reads this on a terminal or in Notion.
- Call out that a refresh loses nothing because the API saves results server-side against the key, and Notion is the permanent export.

## Failure modes

| Symptom | Meaning |
|---|---|
| 401 | Missing or stale `SGK`. Ask the user to confirm `.env` matches the key on the setup page. |
| 400 "Payment failed" | Balance too low for a first run on this role. Runs on already-paid roles are free. |
| 400 "jobId is required" | You sent an empty `jobId`. Fetch the list first. |
| 404 "Job not found" | The role was removed or the id is from a different deployment. |
| 500 "Generation failed" | No engine could serve the request. Check `/api/v1/me/ai`. |
| 503 | Storage quota. Wait and retry later. |
