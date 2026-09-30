---
name: extend-the-panel
description: Use when adding a page, an API route, a new panel feature, or a new agent instruction file to this repo. Covers the proxy rule, the shared error helpers, the markdown renderer boundary, and the styling and breakpoint conventions.
---

# Extending the control panel

## The one rule that is not negotiable

New authenticated data goes through a local proxy route. Never fetch the upstream API from a client component.

The key lives in `lib/env.js` and is read on the server. A proxy route calls through `lib/api.js`, which attaches the bearer token. A client component calls the local route. That chain is the only reason the key stays off the browser.

## Adding a proxy route

Create `app/api/<name>/route.js` and mirror the existing ones:

```js
import { NextResponse } from "next/server";
import { getSomething } from "@/lib/api";
import { fail, guard } from "../me/route";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const blocked = guard();
  if (blocked) return blocked;

  try {
    return NextResponse.json(await getSomething());
  } catch (err) {
    return fail(err);
  }
}
```

`guard()` returns 401 `{ code: "no_key" }` when `SGK` is missing. `fail()` maps an `ApiError` to a status and message, and never leaks a stack trace. Reuse both. If you need a new upstream call, add a typed helper to `lib/api.js` rather than inlining `fetch`.

For anything with a long upstream run, add `export const maxDuration = 300;` the way the roadmaps route does.

## Adding a page

- Route under `app/`, page as a client component when it needs data.
- Fetch with `useApi` from `lib/useApi.js`. It handles abort on unmount, reload, and normalizes non-2xx into `{ error, code }`, so you render `error.error` directly.
- Handle the `no_key` case by rendering `KeyMissing` from `components/States.jsx`. Users hit that state before they have a key, so it should be a good screen, not an error dump.
- Use the existing `hw-*` classes. Do not introduce a new palette.

## Styling rules

- Colors come from the variables in `:root` in `app/globals.css`. Never hardcode a hex value in a component.
- The breakpoint is 768px and only 768px. Do not add 599px or 1024px layout behavior.
- Reuse `hw-card`, `hw-grid`, `hw-btn`, `hw-chip`, `hw-state`. Extending a shared rule beats adding a one-off.

## Rendering AI output

Always route markdown through `components/Markdown.jsx`. It escapes input first, then builds a controlled subset, and only allows `http`, `https`, and `mailto` links. If you need new syntax, extend the renderer and keep the escaping intact. Never set `dangerouslySetInnerHTML` with model output anywhere else, and never add a raw HTML passthrough.

## Adding agent instructions

- Tool-agnostic guidance goes in `skills/` or `setups/` as markdown with `name` and `description` frontmatter. Write the description as trigger phrases, because that is what an agent matches against.
- One source of truth for API paths and failure modes. Reference them rather than repeating them.
- If you add a per-agent folder, keep the shared instructions in `skills/` and do not fork them.

## Before you commit

1. `npm run build` passes.
2. `node scripts/test-markdown.mjs` passes, since you may have touched the renderer.
3. With no `.env`, hitting the new route returns 401 `{ code: "no_key" }`.
4. With a valid `SGK`, the page loads and nothing in the browser bundle contains the key.
