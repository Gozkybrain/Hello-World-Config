"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Cards";
import Loader from "@/components/Loader";
import { ErrorState, KeyMissing, Loading } from "@/components/States";

const TABS = [
  { id: "info", label: "Info" },
  { id: "jobs", label: "Jobs" },
  { id: "news", label: "News" },
  { id: "teams", label: "Teams", locked: true },
];

const UNLOCK_COST = 25;

function Chips({ values, limit = 8, className = "hw-chip" }) {
  const list = (values || []).slice(0, limit);
  if (!list.length) return null;
  return (
    <div className="hw-chips">
      {list.map((v) => (
        <span className={className} key={v}>
          {v}
        </span>
      ))}
    </div>
  );
}

function LinkRow({ label, value }) {
  if (!value || value === "—") return null;
  const href = safeHref(value);
  return (
    <div
      className="hw-pager"
      style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}
    >
      <span className="hw-pager-note" style={{ margin: 0 }}>
        {label}
      </span>
      {href ? (
        <a
          className="hw-link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : (
        <span className="hw-link hw-link--plain">{value}</span>
      )}
    </div>
  );
}

function normalizeInvestors(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((entry) => {
      if (typeof entry === "string") return { name: entry.trim() };
      if (!entry || typeof entry !== "object") return null;
      const name = typeof entry.name === "string" ? entry.name.trim() : "";
      if (!name) return null;
      return {
        name,
        tier: typeof entry.tier === "string" ? entry.tier.trim() : "",
        type: typeof entry.type === "string" ? entry.type.trim() : "",
      };
    })
    .filter(Boolean);
}

// Tier casing is inconsistent in the source data ("Lead" vs "lead"), so
// normalise it for display while leaving acronyms and mixed-case labels alone.
function prettyLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw !== raw.toLowerCase()) return raw;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function Raised({ data, links }) {
  const f = data;
  const linkRows = [
    ["Website", links?.website],
    ["X", links?.twitter],
    ["GitHub", links?.github],
    ["Whitepaper", links?.whitepaper],
  ].filter(([, v]) => v && v !== "—");

  if (!f && !linkRows.length) return null;

  const rounds = Array.isArray(f?.funding_rounds) ? f.funding_rounds : [];
  const leads = normalizeInvestors(f?.lead_investors);
  // Lead investors are usually repeated inside `investors`, so drop the
  // duplicates rather than printing every name twice.
  const leadNames = new Set(leads.map((l) => l.name.toLowerCase()));
  const investors = normalizeInvestors(f?.investors).filter(
    (i) => !leadNames.has(i.name.toLowerCase())
  );
  const nothing =
    !f?.total_raised && !rounds.length && !leads.length && !investors.length;
  if (nothing && !linkRows.length) return null;

  const investorChips = (rows) => (
    <ul className="hw-names">
      {rows.map((inv, i) => (
        <li className="hw-name" key={`${inv.name}-${i}`}>
          {inv.name}
          {prettyLabel(inv.tier) && (
            <span className="hw-investor-tier">{prettyLabel(inv.tier)}</span>
          )}
          {inv.type && <span className="hw-investor-type">{inv.type}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="hw-raised">
      {f?.total_raised && (
        <div className="hw-raised-hero">
          <p className="hw-raised-eyebrow">Total raised</p>
          <p className="hw-raised-total">{f.total_raised}</p>
          {rounds.length > 1 && (
            <p className="hw-raised-note">
              across {rounds.length} rounds
            </p>
          )}
        </div>
      )}

      {rounds.length > 0 && (
        <div className="hw-raised-block hw-raised-block--tight">
          <p className="hw-raised-label">Rounds</p>
          <dl className="hw-rounds">
            {rounds.map((r, i) => (
              <div className="hw-round" key={`${r?.stage || "round"}-${i}`}>
                <dt className="hw-round-stage">{r?.stage}</dt>
                <dd className="hw-round-meta">
                  {r?.amount && <span className="hw-round-amount">{r.amount}</span>}
                  {r?.date && <span className="hw-round-date">{r.date}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {leads.length > 0 && (
        <div className="hw-raised-block">
          <p className="hw-raised-label">Lead investors</p>
          {investorChips(leads)}
        </div>
      )}

      {investors.length > 0 && (
        <div className="hw-raised-block">
          <p className="hw-raised-label">Investors</p>
          {investorChips(investors)}
        </div>
      )}

      {linkRows.length > 0 && (
        <div className="hw-raised-block">
          <p className="hw-raised-label">Links</p>
          <div className="hw-links">
            {linkRows.map(([label, value]) => (
              <LinkRow key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function safeHref(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

function linkDomain(value) {
  const href = safeHref(value);
  if (!href) return "";
  try {
    const host = new URL(href).hostname.replace(/^www\./i, "");
    return host.split(".")[0] || host;
  } catch {
    return "";
  }
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.41-1.31.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.28-1.23 3.28-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.47 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .3Z"
    />
  </svg>
);

const TEAM_LINK_ICONS = {
  x: { label: "X", Icon: XIcon },
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon },
  github: { label: "GitHub", Icon: GitHubIcon },
};

function PersonLinks({ links }) {
  const entries = Object.entries(links || {}).filter(([, v]) => safeHref(v));
  if (entries.length === 0) return null;

  return (
    <div className="hw-team-links">
      {entries.map(([key, value]) => {
        const href = safeHref(value);
        const known = TEAM_LINK_ICONS[key];
        return (
          <a
            key={key}
            className="hw-team-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={href}
            aria-label={known ? `${known.label} profile` : linkDomain(value) || key}
          >
            {known ? (
              <known.Icon />
            ) : (
              <span className="hw-team-link-label">
                {linkDomain(value) || value}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}

function News({ items }) {
  const list = (items || []).filter(
    (n) => n && (n.title || n.content || n.url)
  );
  if (list.length === 0) {
    return (
      <div className="hw-card">
        <p style={{ margin: 0 }}>No coverage yet.</p>
      </div>
    );
  }

  return (
    <div className="hw-news">
      {list.map((item, i) => {
        const href = safeHref(item.url);
        const body = String(item.content || "");
        const Title = href ? "a" : "p";
        return (
          <article className="hw-news-card" key={item.url || `news-${i}`}>
            <Title
              className="hw-news-title"
              {...(href
                ? { href, target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.title || "Untitled"}
            </Title>
            {(item.author || item.publishedAt) && (
              <p className="hw-news-meta">
                {item.author || ""}
                {item.author && item.publishedAt ? " · " : ""}
                {item.publishedAt || ""}
              </p>
            )}
            {body && <p className="hw-news-text">{body}</p>}
          </article>
        );
      })}
    </div>
  );
}

function JobRow({ job, startupKey, purchased }) {
  const title = job.job_title || job.name || "Untitled role";
  const skills = Array.isArray(job.preferred_skills)
    ? job.preferred_skills.filter(Boolean)
    : [];
  const responsibilities = Array.isArray(job.responsibilities)
    ? job.responsibilities.filter(Boolean)
    : [];

  return (
    <div className="hw-card hw-job">
      {purchased ? (
        <Link
          className="hw-item-title hw-job-title"
          href={`/startups/${encodeURIComponent(startupKey)}/${encodeURIComponent(job.job_id)}`}
        >
          {title}
        </Link>
      ) : (
        <p className="hw-item-title">{title}</p>
      )}
      {skills.length > 0 && (
        <Chips values={skills} limit={8} className="hw-tag" />
      )}
      {responsibilities.length > 0 && (
        <div className="hw-job-resp-block">
          <p className="hw-raised-label">Responsibilities</p>
          <ul className="hw-job-resp">
            {responsibilities.map((item, i) => (
              <li key={`${item}-${i}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function StartupDetail() {
  const { key } = useParams();
  const startupKey = decodeURIComponent(key || "");
  // The chosen tab is remembered per startup key, so navigating to another
  // company starts on Info without needing an effect to reset it.
  const [choice, setChoice] = useState({ for: startupKey, tab: "info" });
  const tab = choice.for === startupKey ? choice.tab : "info";
  const setTab = (next) => setChoice({ for: startupKey, tab: next });

  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  async function handleUnlock() {
    if (unlocking) return;
    setUnlocking(true);
    setUnlockError("");
    try {
      const res = await fetch("/api/startups/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: startupKey }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUnlockError(body?.error || "Unlock failed. Try again.");
        return;
      }
      setUnlocked(true);
      setTab("teams");
      reload();
    } catch {
      setUnlockError("Could not reach the server. Try again.");
    } finally {
      setUnlocking(false);
    }
  }

  const { data, error, loading, reload } = useApi(
    `/api/startups?key=${encodeURIComponent(startupKey)}`
  );
  const { data: jobsData, loading: jobsLoading } = useApi(
    `/api/jobs?limit=50&startupKey=${encodeURIComponent(startupKey)}`
  );
  const { data: me } = useApi("/api/me");

  const isAdmin = me?.admin === true || me?.moderator === true;
  const balance = Number(me?.balance ?? 0);
  const canAfford = isAdmin || balance >= UNLOCK_COST;

  if (loading) {
    return (
      <main className="hw-main">
        <Loading />
      </main>
    );
  }

  if (error?.code === "no_key") {
    return (
      <main className="hw-main">
        <KeyMissing error={error} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="hw-main">
        <h1 className="hw-title">Startup</h1>
        <ErrorState
          error={
            error.status === 404
              ? { error: "That startup was not found." }
              : error
          }
          onRetry={reload}
        />
      </main>
    );
  }

  const s = data?.startup || {};
  const jobs = Number(s.jobsCount) || 0;
  const links = s.links || {};
  // Links and the team are revealed only by an actual purchase. `paid` also
  // covers the free tier, so it is not a sufficient signal on its own.
  const purchased = data?.purchased === true || unlocked;

  const teams = Array.isArray(s.team) ? s.team : s.team ? [s.team] : [];
  const jobList = jobsData?.jobs || [];

  const followers = Number(s.paidCount) || 0;
  const followerLabel =
    followers === 0
      ? "No Users following"
      : followers === 1
        ? "1 User Following"
        : `${followers} Users Following`;

  return (
    <main className="hw-page">
      <div className="hw-item hw-item--static hw-head">
        <div className="hw-item-top">
          {purchased && (
            <span className="hw-unlocked" title="Unlocked" aria-label="Unlocked">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 6 9 17l-5-5"
                />
              </svg>
            </span>
          )}
          <Avatar src={s.icon} name={s.name} />
          <div style={{ minWidth: 0 }}>
            <h1 className="hw-title" style={{ margin: 0, fontSize: 22 }}>
              {s.name || "Unnamed"}
            </h1>
            {s.key && <p className="hw-head-key">{s.key}</p>}
            {s.country && <p className="hw-item-sub">{s.country}</p>}
          </div>

          <div className="hw-head-aside">
            <p className="hw-head-count">
              {jobs}
              <span className="hw-head-count-label">
                {jobs === 1 ? "open role" : "open roles"}
              </span>
            </p>

            {!purchased && (
              <button
                type="button"
                className="hw-btn hw-unlock"
                onClick={handleUnlock}
                disabled={unlocking || !canAfford}
                title={
                  canAfford
                    ? `Unlock for ${UNLOCK_COST}`
                    : `You need ${UNLOCK_COST} cowries to unlock this startup`
                }
              >
                {unlocking ? (
                  <>
                    <span className="hw-spin" aria-hidden="true" />
                    Unlocking
                  </>
                ) : (
                  <>
                    <svg
                      className="hw-unlock-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 11V8a5 5 0 0 1 9.5-2M4 11h16v10H4z"
                      />
                    </svg>
                    Unlock
                  </>
                )}
              </button>
            )}

            {unlockError && (
              <p className="hw-head-err" role="alert">
                {unlockError}
              </p>
            )}
          </div>
        </div>

        <div className="hw-head-meta">
          <div className="hw-head-pills">
            {s.date && <span className="hw-head-date">Listed {s.date}</span>}
            <span className="hw-head-follow">{followerLabel}</span>
          </div>
          {s.description && <p className="hw-head-desc">{s.description}</p>}
        </div>

        <Chips values={s.categories} className="hw-tag" />
      </div>

      <div className="hw-tabs" role="tablist">
        {TABS.map((t) => {
          const locked = t.locked && !purchased;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              disabled={locked}
              className={`hw-tab${tab === t.id ? " hw-tab--on" : ""}`}
              onClick={() => setTab(t.id)}
              title={locked ? "Unlock to see the team" : undefined}
            >
              {t.label}
              {locked && (
                <svg
                  className="hw-tab-lock"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 11V8a5 5 0 0 1 10 0v3"
                  />
                  <rect
                    x="4"
                    y="11"
                    width="16"
                    height="10"
                    rx="2"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {tab === "info" && (
        <div className="hw-tab-panel">
          {(s.skills || []).length > 0 && (
            <div className="hw-priority hw-priority--first">
              <p className="hw-raised-label">Skills this startup prioritises</p>
              <Chips values={s.skills} limit={40} className="hw-tag" />
            </div>
          )}

          <Raised data={s.fundraising} links={purchased ? links : null} />
        </div>
      )}

      {tab === "jobs" && (
        <div className="hw-tab-panel">
          {jobsLoading ? (
            <Loader />
          ) : jobList.length === 0 ? (
            <div className="hw-card">
              <p style={{ margin: 0 }}>No open roles right now.</p>
            </div>
          ) : (
            <div className="hw-jobs">
              {jobList.map((j, i) => (
                <JobRow
                  key={j.job_id || i}
                  job={j}
                  startupKey={startupKey}
                  purchased={purchased}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "news" && (
        <div className="hw-tab-panel">
          <News items={s.news} />
        </div>
      )}

      {tab === "teams" && purchased && (
        <div className="hw-tab-panel">
          {teams.length === 0 ? (
            <div className="hw-card">
              <p style={{ margin: 0 }}>No team information yet.</p>
            </div>
          ) : (
            <div className="hw-grid">
              {teams.map((m, i) => (
                <div className="hw-card hw-person" key={m?.name || i}>
                  <div className="hw-person-top">
                    <Avatar src={m?.img || s?.icon} name={m?.name} />
                    <div className="hw-person-id">
                      <p className="hw-item-title" style={{ margin: 0 }}>
                        {m?.name || "Team member"}
                      </p>
                      {m?.role && (
                        <p className="hw-item-sub" style={{ margin: "3px 0 0" }}>
                          {m.role}
                        </p>
                      )}
                    </div>
                  </div>
                  {m?.background && <p className="hw-person-bio">{m.background}</p>}
                  <PersonLinks links={m?.links} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}