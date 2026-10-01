"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Cards";
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

function Row({ label, value }) {
  if (!value || value === "—") return null;
  return (
    <div
      className="hw-pager"
      style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}
    >
      <span className="hw-pager-note" style={{ margin: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, textAlign: "right", minWidth: 0 }}>{value}</span>
    </div>
  );
}

function Raised({ data }) {
  const f = data;
  if (!f) return null;

  const rounds = Array.isArray(f.funding_rounds) ? f.funding_rounds : [];
  const investors = Array.isArray(f.investors) ? f.investors.filter(Boolean) : [];
  const funds = Array.isArray(f.funds) ? f.funds.filter(Boolean) : [];
  const nothing = !f.total_raised && !rounds.length && !investors.length && !funds.length;
  if (nothing) return null;

  return (
    <div className="hw-raised">
      {f.total_raised && (
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

      {investors.length > 0 && (
        <div className="hw-raised-block">
          <p className="hw-raised-label">Investors</p>
          <ul className="hw-names">
            {investors.map((inv, i) => (
              <li className="hw-name" key={`${inv}-${i}`}>
                {inv}
              </li>
            ))}
          </ul>
        </div>
      )}

      {funds.length > 0 && (
        <div className="hw-raised-block">
          <p className="hw-raised-label">Funds</p>
          <ul className="hw-funds">
            {funds.map((fund, i) => (
              <li className="hw-fund" key={fund?.key || i}>
                {fund?.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="hw-fund-icon" src={fund.icon} alt="" />
                )}
                <span className="hw-fund-name">{fund?.name}</span>
                {fund?.category?.name && (
                  <span className="hw-fund-cat">{fund.category.name}</span>
                )}
              </li>
            ))}
          </ul>
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

  const inner = (
    <>
      <p className="hw-item-title" style={{ margin: 0 }}>
        {title}
      </p>
      {(job.categories || []).length > 0 && (
        <Chips values={job.categories} limit={4} className="hw-tag" />
      )}
      {purchased && (
        <span className="hw-job-open">
          View role
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-6-6 6 6-6 6"
            />
          </svg>
        </span>
      )}
    </>
  );

  if (!purchased) {
    return <div className="hw-card hw-job">{inner}</div>;
  }

  return (
    <Link
      className="hw-card hw-job hw-job--link"
      href={`/startups/${encodeURIComponent(startupKey)}/${encodeURIComponent(job.job_id)}`}
    >
      {inner}
    </Link>
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

  return (
    <main className="hw-main">
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

        {(s.date || s.description) && (
          <div className="hw-head-meta">
            {s.date && <span className="hw-head-date">Listed {s.date}</span>}
            {s.description && <p className="hw-head-desc">{s.description}</p>}
          </div>
        )}

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

          <Raised data={s.fundraising} />

          {purchased && (
            <>
              <h2 className="hw-section-title">Links</h2>
              <div className="hw-card">
                <Row label="Website" value={links.website} />
                <Row label="X" value={links.twitter} />
                <Row label="GitHub" value={links.github} />
                <Row label="Whitepaper" value={links.whitepaper} />
              </div>
            </>
          )}
        </div>
      )}

      {tab === "jobs" && (
        <div className="hw-tab-panel">
          {jobsLoading ? (
            <Loading />
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
                <div className="hw-card" key={m?.name || i}>
                  <p className="hw-item-title" style={{ margin: 0 }}>
                    {m?.name || "Team member"}
                  </p>
                  {m?.role && <p className="hw-item-sub">{m.role}</p>}
                  {m?.bio && <p style={{ marginTop: 8 }}>{m.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
