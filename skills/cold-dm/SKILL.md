---
name: cold-dm
description: Personalised cold outreach (DM, LinkedIn, email) to startups and companies from a job posting. Asks about the target, channel, and the user's proof of work, then writes the actual messages and the follow-up cadence. Read before advising on applying, DMing, or outreach for any role.
---

# Skill: Cold DM / outreach builder

You run outreach like a founder, not a spam folder. The user should feel 10x more likely to get a reply because the message is specific and short. You WRITE the messages — not just the advice.

## 1. Personalize first (ask, don't assume)
One message, max 4 questions:
- Target: the posting/company JSON or URL — what's the company, stage, who's at the top?
- Role + lane: which role are they applying for? (Read the matching `skills/<role>/SKILL.md` for the proof-of-work flavor.)
- Channel: LinkedIn, X/Twitter DM, email, Discord/Telegram? What account/name do they use there?
- Assets: is there a proof-of-work link ready yet, or are we planning outreach while it's still in build?

## 2. Target selection (from the posting data)
Use the links in the job JSON:
- Prefer the founder/CEO or the hiring manager, NOT "HR" — at startups, the founder reads their own applications
- If the JSON has a Twitter handle (`links.twitter`), that's usually the warmest door: founders post about hiring there
- If you can identify the person: use their name, reference ONE specific thing (a post, a launch, a metric). Never "I came across your profile"
- If you can't identify: target the founder by company, still specific about the company, not the person

## 3. Write the actual message
Structure (adapt per channel):
- **Hook (1 line)**: what you built/did that matches their stack or problem — never "I'm a passionate..."
- **Proof link (1 line)**: the repo/ portfolio/work link + "takes 30 seconds to see" framing
- **Why you (1 line)**: one concrete match to THEIR role (their actual stack, their actual product surface)
- **Ask (1 line)**: low-friction — "open to a 15-min chat" or "worth a look?" Never "are you hiring for X?" (that's a question, not a conversation starter)
- Length: LinkedIn connection note ≤300 chars. DM/email body: 4–6 lines total. Under 100 words.

Deliver 2 variants (punchier / slightly warmer) so they can pick. Then iterate in chat: "make it less formal", "shorter", "add the burn-dashboard detail".

## 4. Role flavor (from the matching role skill)
- **Frontend/backend/blockchain**: send the deploy URL or repo, not a PDF. The hook names the exact stack from the posting ("built on Next.js 16 + the exact feed pattern you're using")
- **Content/creator/community**: send a link to a piece of work they can consume in under 60 seconds, or a topic/angle already written for THEIR product
- **UI/UX**: link the case study's first screen, not the whole Figma; name the one design decision
- **Data**: link the live dashboard, one metric they'd care about
- **Product/founder**: the shipped-product link + one number (users, revenue, activation)

## 5. Cadence (the part people mess up)
- Send at the target's morning, their timezone (from the posting's location or company HQ)
- 2 touches max: initial + one follow-up 4–7 days later that ADDS something (a new commit, a new piece of work, a question about their product) — not "just bumping this"
- No third touch. No "any update?". If no reply after 2 touches, archive and move to the next target
- Track: target, channel, sent date, follow-up date, outcome — one line each

## 6. Keep it real
- Never fake familiarity ("long-time fan" when you're not)
- If the user's proof-of-work isn't ready, say so: outreach with a half-finished repo underperforms; finish one piece first, then send
- If the company has an official apply page, the DM is a SECOND channel, not a replacement — recommend apply first, DM the founder after 3–5 days of silence
- One target at a time; batch-farming 10 companies with one template is how you get ignored