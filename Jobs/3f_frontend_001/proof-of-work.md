---
job_id: 3f_frontend_001
startup_key: 3-f-labs
job_title: "3F - Frontend Engineer"
startup_name: "3F"
model: "agent (claude), skills: frontend + cold-dm"
generated_at: 2026-10-03T23:40:03.701Z
source: POST /api/v1/roadmaps
---
# Proof of Work: 3F Frontend Engineer

## 1. Morpho Vault Explorer

**Description**
A live browser for Morpho vaults. See APY, TVL and LLTV per vault across chains, filter by
risk, then model a leveraged loop and watch health factor and liquidation distance before you
commit.

**What it builds**
A Next.js app that reads Morpho's subgraph, validates every response with Zod, and normalises
into a cache keyed by vault address. On top of that: a paginated vault list with filters that
compose, a leverage loop simulator computing health factor and distance to liquidation, and a
polling layer that cancels stale requests instead of letting them overwrite fresh data.
Wallet reads through wagmi and viem. Deployed, with a preview URL per PR.

**What it solves, relative to the posting**
Their posting names three things: vault selection interfaces, leverage dashboards, Morpho
integration. Choosing a vault today means reading docs and trusting a spreadsheet, because the
risk variables are scattered. This makes the risk legible on one screen, including the awkward
case where the highest APY is the worst choice. It is the same surface they are building, one
thin slice of it.

**Stack**
TypeScript, Next.js, viem, wagmi, Zod, Morpho subgraph

**Duration**
3 weeks. 5 days typed data layer and subgraph validation, 5 days vault list with composing
filters, 5 days leverage simulator and polling.

**Extra: how to get it tested and reviewed for assumed traction**
- Ship it into 3F's own Telegram (t.me/3flabsxyz) and ask founder feedback before anything
  else. Their roadmap beats any cold audience.
- Post the live link in the 3F X thread with one question, not "feedback welcome". For example,
  whether an LLTV-first sort is what a depositor would actually want.
- Deploy a preview per PR and send the preview URL to three engineers who work on lending
  interfaces. Ask for a code review specifically. A review is a stronger signal than a like.
- List it on the Hello World jobs board as a public artefact with the deploy link.
- Submit it to an EthGlobal showcase or a local DeFi meetup demo slot. A public demo forces you
  to present it and collects feedback you did not have to ask for.
- Offer a small bounty for written reviews on a dev.to aggregator. Cheaper than a week of
  outreach, and the reviews stay public.

## 2. Leverage Position Dashboard

**Description**
Read only view of your positions: health factor, distance to liquidation, projected interest
cost, and a rebalance simulator showing the result side by side with the current position.

**What it builds**
A positions view that computes health factor and liquidation distance per position and
projects interest cost over a chosen horizon. Plus a rebalance simulator that takes a proposed
supply or borrow amount and renders the resulting health factor and projected return against
the live position, so the trade off is visible before anything is signed. Reuses the same
polling and validation layer as the explorer.

**What it solves, relative to the posting**
It answers the leverage dashboard half of their posting directly. The rebalance simulator is
the interesting part, because it answers "would this change be safer and still worth it", which
is the question every leveraged position raises and no dashboard currently answers. It is weak
on vault selection, so it covers roughly half the role.

**Stack**
TypeScript, viem, health factor maths, polling hooks

**Duration**
2 weeks. 4 days position maths with tests, 6 days live view, 4 days simulator.

**Extra: how to get it tested and reviewed for assumed traction**
- Post the simulator specifically in DeFi trading communities, where leverage is the daily
  conversation. The screenshot of liquidation distance is the hook.
- Ask the five people whose position you are modelling to try it. Real users who recognise
  their own numbers become reviewers for free.
- Offer it as a forkable read only template. Forks are public proof that someone cared.
- Lead with the maths and the tests rather than the UI. That is what a protocol engineer will
  actually read.

## 3. Yield Strategy Backtester

**Description**
Replay historical APY against a looping strategy. Shows realised return, maximum drawdown, how
many times the position would have liquidated, and how much yield the borrow cost ate.

**What it builds**
A historical APY pipeline feeding a simulation engine that replays a looping strategy across
drawdowns and rate spikes. It counts liquidation events rather than hiding them, accounts for
borrow cost against gross yield, and renders the result as charts plus a written report. The
dataset and the method ship alongside it so the maths can be checked.

**What it solves, relative to the posting**
3F works in RWA and yield. Backtesting yield strategies answers "what did this actually return
after borrowing costs", which is the question behind every looping pitch in that space. It is
the most interesting of the three and the weakest fit, because it is maths and charts with no
vault selection interface and no Morpho frontend work. A good second artefact, a poor first
one.

**Stack**
TypeScript, simulation maths, charting libraries, historical data

**Duration**
3 weeks. 1 week data pipeline, 2 weeks simulation engine with drawdown and liquidation events,
1 week charts and report.

**Extra: how to get it tested and reviewed for assumed traction**
- Publish the findings as a short writeup, not just the tool. A surprising number about borrow
  costs gets shared. A dashboard does not.
- Post it in yield and RWA communities where the backtest speaks directly to the thesis.
- Publish the dataset and method so others can check the maths. That invites real scrutiny,
  which is what you want from reviewers instead of applause.
- Bring it to a 3F call as a supporting argument, once the explorer exists.

## What to build first

Build the Morpho Vault Explorer, with the Leverage Position Dashboard as its leverage tab. One
link, covering all three things their posting asks for.

Cold outreach lives or dies on a single link that a stranger opens for thirty seconds. One
deployed artefact that explains itself beats three repositories covering a third each. The
Explorer is the only one of these that covers the whole posting while staying small enough to
finish in three weeks, and finishing is the constraint that actually binds before you message
anyone.

**Do not compromise on TypeScript at the data boundary.** It is the first required skill on
the posting and it is missing from your profile, so it is the first thing a reviewer notices.
