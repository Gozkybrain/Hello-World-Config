---
name: connect-an-engine
description: Use when the panel has no engine connected, when generation is disabled, or when a user wants to use their own model instead of a hosted one. Covers OpenRouter, Ollama and custom endpoints, and what each option costs the user.
---

# Connecting an AI engine

Generation runs on an engine the user connected themselves. The panel reads that list from the server, so there is no engine setup inside this repo. If the count is zero, the fix happens on the Hello World setup page.

## Why the user's choice matters

Models are the user's money and their data. Some run on a free hosted tier, some run on a laptop with Ollama, some are a custom endpoint the user already pays for. Code in this repo should read the connected list and use what is there, never assume a provider, and never add a silent fallback the user did not choose.

## OpenRouter

Hosted, and the free model chain means a request can succeed with no spend. Model ids look like `google/gemma-4-31b-it:free` or `openai/gpt-oss-20b:free`. A request can fall back to a different model than the one requested, which is why the response reports `usedModel` and `fallback`. Surface those to the user rather than implying the exact model ran.

## Ollama

Local. The server calls `http://localhost:11434/v1` and the inference happens on the user's machine, which means job data never leaves it. Models are the ones the user has pulled, typically `llama3`, `llama3.1`, `gemma2`, or `mistral`. If requests fail with Ollama, the most likely cause is that the server cannot reach the user's loopback, not that the model is missing.

## Custom endpoint

Anything that speaks the OpenAI-compatible shape. Use it when the user has an endpoint the built-in providers do not cover.

## Checking what is connected

```bash
curl -s -H "Authorization: Bearer $SGK" https://helloworldjobs.net/api/v1/me/ai
```

The response lists each connected engine with its base and models, plus a `defaultProvider` when exactly one is connected. From inside the repo, `GET /api/engines` on the local panel returns the same thing without exposing the key.

## Choosing a model in the UI

The engine picker in the job detail page is built from that list. When several engines are connected, the user picks. When exactly one is connected, the server sets a default and you can omit `model` from the request.

## Reporting honestly

If a run used a fallback model, say so. If a Notion export failed, say so and keep the generated content, since the export is separate from generation. If no engine could serve a request, do not retry blindly, because a retry can cost another 25 tokens on a role the user has not paid for yet.
