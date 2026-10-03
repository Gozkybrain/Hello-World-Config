# AGENTS.md - Hello World Config

This is the operating guide for any agent working inside this repository. Read it before making changes.

## Purpose

`hello-world-config` is a local-only control panel and agent wiring pack. It runs at `http://localhost:2026`, reads the Agent API Key from `.env` (SGK), and proxies all authenticated requests to the Hello World v1 API. The key never reaches the browser. The repo also ships agent-neutral skills and setup instructions.

## Environment

The app reads configuration on the server only (`lib/env.js`):

- `SGK` - Required Agent API Key (`sgk_...`). Treat the placeholder `sgk_your_key_here` as "not configured".
- `HW_API_BASE` - Optional API base override. When set, fallback to localhost is disabled (useful for self-hosted deployments).
- `.env` is gitignored and must never be committed.

## API architecture

1. UI (browser) calls local Next.js API routes under `/app/api/*`.
2. Each proxy (`app/api/me`, `app/api/jobs`, `app/api/startups`, `app/api/engines`, `app/api/roadmaps`) checks for `SGK` and calls the upstream v1 API via `lib/api.js`.
3. `lib/api.js` attaches `Authorization: Bearer ${SGK}` and tries bases in order from `getBases()`. Public (`https://helloworldjobs.net`) is preferred; `http://localhost:3000` is a fallback unless `HW_API_BASE` is set. 401/403 are treated as terminal (bad key). 5xx/404 can fall back to the next candidate.
4. All proxy routes return `{ error, code }` shapes on failure (`fail()` helper). No stack traces leak to the browser.

## Saving generated material locally (`Jobs/`)

Generated roadmaps and proof-of-work are written to disk instead of Notion. Output layout:

```
Jobs/
  index.json          # manifest of everything saved
  <jobId>/
    roadmap.md        # application guide + role snapshot
    proof-of-work.md  # project ideas
    meta.json         # provenance + file list
```

One folder per job id, flat. `startupKey` is recorded in the front matter and `meta.json` but is not part of the path.

`POST /api/roadmaps/save` (`app/api/roadmaps/save/route.js`, helper `saveRoadmap()` in `lib/api.js`) does the writing.

- **Saves cost nothing upstream.** The route makes no network calls and reads no Firestore. Only generation (`POST /api/roadmaps`) touches the database, so call generate once, then save as often as you like.
- **Check `Jobs/index.json` or the per-job `meta.json` before generating.** If the files already exist you can answer from disk instead of spending an API read.
- Body accepts `roadmap`, `applicationGuide` and `projects` (alias `proofOfWork`), plus `jobId`, `startupKey`, `jobTitle`, `startupName`, `model`. Each piece is optional and saves independently, so a proof-of-work-only save never disturbs `roadmap.md`.
- `jobId` becomes the directory name and is restricted to `[A-Za-z0-9._-]+`; traversal attempts are rejected with a 400. `startupKey` is optional metadata only.
- Re-saving identical content is a no-op (`changed: false`) and keeps the original `generated_at`, so timestamps reflect the run that actually produced the content.
- `Jobs/` holds real generated work and is tracked in git, so it can be reviewed and shared. Do not gitignore it.

## Generation output format (canonical)

Every roadmap and proof-of-work file must follow this. Do not invent a new shape per job.

### `roadmap.md` - phase and day tracking

```markdown
## Phase 4 - Follow up

**Days 18-19**

- [ ] Phase complete

- [ ] Days 18: Ship something real first
  - detail items, plain bullets, not checkboxes

- [ ] Days 19: Send one follow-up, then stop
  - detail items
```

Rules:

- **The `## Phase N - Title` heading is the only place the phase name appears.** Never repeat the title inside the checkbox - a checkbox reading `Phase 4 - Follow up` directly under a `## Phase 4 - Follow up` heading is duplication.
- Checkboxes exist at exactly two levels: one `Phase complete` per phase, and one per day block.
- Detail items are plain nested bullets. They are reference material, not progress tracking. Do not make them checkboxes.
- Put the phase's day span on its own `**Days X-Y**` line under the heading, not in the checkbox.
- Every phase needs a day span. If a phase is genuinely undated, omit the `**Days**` line rather than inventing one.
- Frontmatter is added by the save route. Never write `---` front matter into the body yourself.
- `<aside>` blocks hold ready-to-send messages. They survive the markdown renderer as callouts.

### `proof-of-work.md` - fixed field order

Keep it short. Prolix proof-of-work reads as padding and nobody finishes it. Each project gets
exactly these six fields, in this order, under a numbered title:

```markdown
## 1. Project Name

**Description**
Two or three sentences. What it is and what someone can do with it.

**What it builds**
The concrete artefact. Name the actual components built and the data flow, in three or four
sentences. Say what is deployed, not what is planned.

**What it solves, relative to the posting**
Tie it to the posting's actual responsibilities and the company's product surface. Say which
of their stated requirements this covers, and be honest about which ones it does not.

**Stack**
Comma-separated. Technologies only, no prose.

**Duration**
Realistic weeks, with a short breakdown of where the time goes.

**Extra: how to get it tested and reviewed for assumed traction**
Concrete distribution tactics. Assume zero existing audience.
```

Rules:

- No architecture write-ups, no repo layouts, no code-level design notes. Those belong in the
  repository, not in the proof-of-work file.
- `Duration` must be honest. A credible three-week estimate beats an optimistic one that
  slips.
- The traction field is required and must be specific: named channels, who to ask, what to
  post. "Share it on social media" is not acceptable.
- Close the file with a short **What to build first** section naming the one project to build
  and why, in a paragraph.
- Keep the whole file under roughly 120 lines.

## Code conventions

- **Never use em dashes or en dashes.** No `—`, no `–`. Use a plain hyphen `-`, a colon, or rewrite the sentence. Applies to headings, body text, ranges (`Days 1-3`, not `Days 1–3`) and field labels. This is absolute: do not reintroduce them.

- **Server-only key**: Never read `SGK` in client components. All key access lives in `lib/env.js` and is used only in server routes/server utilities.
- **Next.js App Router**: Use `app/` with route handlers (`route.js`). Dynamic routes are marked `export const dynamic = "force-dynamic"`.
- **Path aliases**: `@/*` maps to repo root (`jsconfig.json`).
- **Markdown rendering**: AI output must pass through `components/Markdown.jsx`. It escapes all input, blocks `javascript:` URLs, only allows `http(s)` and `mailto:`, and renders HTML in a controlled subset (headings, lists, tables, fenced code, blockquotes, `<aside>` → callout). Never inject raw HTML from model output.
- **Styling**: CSS variables in `:root` (zinc dark theme). Use existing class names (`hw-*`). Mobile breakpoint is 768px, consistent with the site-wide rule.
- **Error handling**: Local proxies should call `guard()` first (returns `{code:'no_key'}`) and `fail(err)` for downstream errors. Client components use `lib/useApi.js` which normalizes non-2xx to `{ error, code }`.
- **TypeScript**: Not required. Follow existing plain JS style (no TypeScript annotations unless necessary). No comments added unless asked.

## Role context (skills/)

`skills/` holds one directory per role, each with a `SKILL.md` (`frontend/`, `backend/`, `mobile/`, `data/`, `security/`, `devops/`, `blockchain/`, `uiux/`, `product/`, `content/` for creators/community, `writer/`, `educator/`, plus `cold-dm/` for outreach). Each role skill is a roadmap builder: it personalizes to the user, generates a dated roadmap, proposes proof-of-work, and hands over the build/execution plan - and can produce the actual material (scripts, courses, drafts, specs) in conversation. Before generating any roadmap, project plan, proof-of-work idea, or role-specific advice: read the matching `skills/<role>/SKILL.md` first. Before advising on applying, cold DMs, LinkedIn, or email outreach: read `skills/cold-dm/SKILL.md` first. If no matching role directory exists, say so instead of guessing. Add new role directories as needed.

## Key files

| File | Purpose |
|---|---|
| `lib/env.js` | Server-only env reading (SGK, HW_API_BASE, base resolution) |
| `lib/api.js` | v1 Agent API client with fallback and error classification, plus `saveRoadmap()` for local disk writes |
| `app/api/roadmaps/save/route.js` | Writes generated material to `Jobs/` (no network, no Firestore) |
| `Jobs/index.json` | Manifest of saved roadmaps/proof-of-work - check before generating |
| `Jobs/<jobId>/` | One folder per job: `roadmap.md`, `proof-of-work.md`, `meta.json` |
| `app/api/me/route.js` | Shared helpers (`guard`, `fail`) used by other proxies |
| `components/Markdown.jsx` | Secure markdown → React (XSS-hardened) |
| `lib/useApi.js` | Client fetch helper (auto-reload, abort-safe) |
| `config.json` | Shared contract for engines/defaults (agent-readable) |

## Building and testing

- Install: `npm install`
- Dev: `npm run dev` (port 2026). Turbopack is enabled.
- Build: `npm run build` (must pass before committing)
- Smoke test: with no `.env`, `/api/me` should return 401 `{code:'no_key'}`. With a valid `SGK`, overview should load and `/api/jobs` should return paginated results.

## Do and don't

- **Do** keep the key server-only. If you add any code that sends the key to the client, revert it.
- **Do** keep the Markdown renderer strict. If you extend it, preserve escaping and the URL allowlist.
- **Do** match the existing UI conventions (`hw-*` classes, zinc palette).
- **Don't** add Markdown links to localhost or internal dev docs in user-facing text (the setup page already enforces that). This repo's README is the local control panel README and should remain clean.
- **Don't** commit `.env`, node_modules, `.next`.
- **Don't** modify the fallback behavior in a way that leaks the key or bypasses the `HW_API_BASE` override.

## Skills and setups

`skills/` and `setups/` contain neutral markdown instructions for agents.

- `skills/<role>/SKILL.md` - role roadmap builders. Read the matching one before any roadmap, plan, proof-of-work, or role advice (see above).
- `setups/first-run.md` - ordered install/troubleshooting checklist. Read it before helping anyone set up, run, or debug this panel.
- `setups/connect-an-engine.md` - OpenRouter/Ollama/custom engine wiring and cost. Read it before helping with engines, model selection, or generation failures.

Keep them agent-agnostic (no tool-specific lock-in unless unavoidable).

## Deployment note

This is designed to run locally on the user's laptop. The setup page (`hello-world-jobs/app/(user)/setup/page.jsx`) instructs users to clone this repo, run `npm install`, create `.env`, and run `npm run dev` on port 2026. Any copy changes there should stay in sync with what this README states.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
