---
name: first-run
description: Use the first time someone installs this repo, or whenever the panel shows no API key, cannot start, or the user is unsure what to do next. Ordered checklist from clone to a working local panel.
---

# First run

Work through these in order. Stop at the first step that fails and fix it before continuing, because each step depends on the previous one.

## 1. Confirm the runtime

```bash
node -v
```

Need 18 or newer. If the command is not found, the user needs to install Node from nodejs.org and reopen the terminal.

## 2. Get the code

Either download the ZIP and unzip it, or clone it:

```bash
git clone https://github.com/Gozkybrain/Hello-World-Config.git
cd Hello-World-Config
```

If they used the ZIP, the folder is `Hello-World-Config-main` unless they renamed it. This is the single most common stumble, and every later command assumes they are inside the project folder.

## 3. Install

```bash
npm install
```

Takes under a minute. There is nothing to build first and nothing to deploy.

## 4. Add the key

Create `.env` in the project root:

```bash
echo "SGK=sgk_your_key_here" > .env
```

Then open `.env` and replace the placeholder with the key from the setup page. Confirm `.env` is not committed. If the user ever regenerates their key, this file goes stale and every request returns 401 until they update it and restart.

## 5. Start

```bash
npm run dev
```

The panel prints a local address, normally `http://localhost:2026`. Leave the terminal open.

## 6. Confirm it is actually working

Open the address and check, in order:

1. The header pill says "Key loaded", not "No key".
2. The overview shows a balance. A real number means the key authenticated.
3. The engine count is not zero. If it is, generation will be disabled until the user connects a model on the setup page.
4. The jobs list loads. If it is empty but the key is valid, try the search box with a broad term.

## Troubleshooting

| What you see | Why | Fix |
|---|---|---|
| "No Agent API Key configured" | No `.env`, or the placeholder is still there | Create or edit `.env`, then restart |
| "Your Agent API Key was rejected" | Key was regenerated, or `.env` has a stray quote or space | Copy the key again, paste it cleanly, restart |
| Engine count is 0 | No model connected | Connect OpenRouter or Ollama on the setup page |
| Could not reach the API | The deployment is down, or `HW_API_BASE` points somewhere wrong | Check the variable; unset it to use the public deployment |
| Port 2026 already in use | Another process holds the port | Stop the other process, or run on a different port |
| Jobs load, generation fails | Engine cannot serve the request | Check `/api/v1/me/ai` and reconnect the engine |

## What to tell the user

Once it runs, the honest framing is that their laptop is the server. Nothing was deployed, nothing is being rented, and the key stays in their `.env`. Roadmaps are saved server-side against their key, and Notion is the permanent export.
