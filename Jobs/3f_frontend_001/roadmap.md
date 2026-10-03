---
job_id: 3f_frontend_001
startup_key: 3-f-labs
job_title: "3F - Frontend Engineer"
startup_name: "3F"
model: "agent (claude), skills: frontend + cold-dm"
generated_at: 2026-10-03T23:30:49.998Z
source: POST /api/v1/roadmaps
---
# 3F Frontend Engineer - Outreach Roadmap

**Posting:** `3f_frontend_001` · 3F · posted 23 April 2026
**Warmest door:** `x.com/3flab_xyz` · second: `t.me/3flabsxyz` · site: `3f.xyz`

Progress is tracked at phase and day level only. Tick those in the file, or tell me to mark
them and I will update it in place. The detail underneath each day is reference, not tracking.

## Target

3F hires for a frontend engineer to build vault selection interfaces, leverage dashboards
and Morpho integrations. The public job payload carries no founder name, so outreach targets
the company by handle rather than guessing at a person. Never open with "I came across your
profile."

## What this plan skips, and why

Your profile already lists React, Next.js, Web3, API integration, Express, MongoDB and
Firebase. Nothing here teaches component composition, App Router routing, basic fetch and
CRUD, or wallet connection - those are things you ship daily. The posting interviews for
Morpho depth and TypeScript rigour, not React fundamentals.

## The one gap that blocks outreach

Add TypeScript to your profile. It is the first required skill on the posting and it is absent
from your stack. A founder opens the link you send; if the repo is JavaScript the message dies
at the link. This is the only item here that is genuinely blocking, so do it first, before
Phase 1.

## Phase 1 - Build the proof of work

**Days 1-9**

- [ ] Phase complete

- [ ] Days 1-3: Typed data layer
  - Scaffold the Next.js 16 app with TypeScript enabled from the first commit
  - Set up viem clients for the chains you are targeting
  - Write the typed vault model as discriminated unions per chain
  - Validate the Morpho subgraph payload with Zod at the fetch boundary
  - Confirm a deliberately bad payload is rejected by the schema, not crashing three components deep

- [ ] Days 4-6: Vault list and filters
  - Paginated vault list showing APY, TVL and LLTV
  - Chain filter and risk filter that compose with each other
  - Sortable APY and TVL columns
  - Skeletons matching final row dimensions so nothing shifts on load
  - Error states: stale-data banner, partial-failure rows, retry that does not blank the table

- [ ] Days 7-9: Leverage simulator and live data
  - Leverage loop simulator with health factor and distance to liquidation
  - Positions view that updates live
  - `AbortController` per request plus a request sequence guard against stale responses
  - Poll only the fields that move instead of refetching the whole vault set
  - Virtualise the vault list

## Phase 2 - Ship it and make it legible

**Days 10-12**

- [ ] Phase complete

- [ ] Days 10-11: Deploy and document
  - Deploy to Vercel, confirm the preview works on each PR
  - README that explains what it is before any install instructions, with a screenshot
  - GitHub Actions running lint, typecheck and Playwright
  - Add TypeScript to your profile now that the repo proves it

- [ ] Days 12: Mobile and plain-language pass
  - Open the link cold on your own phone with no prior context
  - Vault table collapses to stacked cards at 375px
  - Leverage simulator works as a stepped flow on mobile
  - Positive and negative APY states distinguishable without relying on colour alone
  - Plain-language labels on every risk field, no protocol jargon in the UI

## Phase 3 - First outreach

**Days 13-14**

- [ ] Phase complete

- [ ] Days 13: Write both variants
  - Write the punchy and warmer variants before sending either, so you are choosing rather than drafting
  - Replace `LINK` with the live URL
  - Read the punchy variant out loud - if it sounds like a template, rewrite it

- [ ] Days 14: Send
  - Send the first message to the X handle during their morning
  - Apply through the official channel as well, if one exists
  - Log target, channel, sent date and follow-up date in your tracking table

<aside>
**Punchy variant - X or LinkedIn**

Built a live Morpho vault explorer - real APY, TVL and LLTV across chains, plus a leverage
loop calculator that shows liquidation distance before you sign. Next.js, TypeScript, viem.
30 seconds to see it: LINK

Open to a 15-min chat about how you surface vault risk in the product?
</aside>

<aside>
**Warmer variant - Telegram or email**

Hi 3F team - I built a vault selection interface over live Morpho data after reading your
frontend posting. It pulls real APY, TVL and LLTV per chain and models a leveraged loop so
you can see liquidation distance before committing. TypeScript and viem, deployed and live.

Worth a look if the risk surface is something you are still working through?
</aside>

Both name the stack and link the asset. Neither asks "are you hiring" - that is a question,
not a conversation opener.

## Phase 4 - Follow up

**Days 18-19**

- [ ] Phase complete

- [ ] Days 18: Ship something real first
  - A commit, a feature or a fix - the follow-up must lead with what changed

- [ ] Days 19: Send one follow-up, then stop
  - Send the follow-up four to seven days after the first message
  - If there is no reply after two touches, archive the target and move on

<aside>
**Follow-up template**

Shipped health-factor tracking on the explorer since I last wrote - it now recalculates
liquidation distance on every position update instead of on refresh. Live dashboard: LINK

Happy to walk through how I handled the polling if that is useful.
</aside>

## Phase 5 - Performance note

**Days 20-22**

- [ ] Phase complete

- [ ] Days 20-22: Profile, improve, publish
  - Profile before optimising and record the flame graph rather than a guess
  - Identify the slowest interaction and name the metric it affects
  - Make one targeted improvement
  - Re-profile and record the before and after numbers
  - Publish both profiles in the README

**Checkpoint:** you can name the metric you improved. If you cannot, the work does not count.

## Cadence rules

These are standing rules, not tracked steps:

- Send at the target's morning in their timezone
- Maximum two touches per target, ever
- Apply first, then treat the DM as a second channel after three to five days of silence
- One target at a time - ten companies from one template is how you get ignored
- Never fake familiarity

## If nothing replies

Treat a low reply rate as normal at this volume rather than as a verdict on the work. Eight to
ten sent with two replies is a good ratio, and the variable that moves it is the asset. Put the
next block of time into the explorer, not into rewriting the message. Only move to a second
startup once the asset is strong enough to carry two conversations.
