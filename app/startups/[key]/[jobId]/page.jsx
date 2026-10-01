"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Cards";
import { ErrorState, KeyMissing, Loading } from "@/components/States";

function Tags({ values, limit = 12 }) {
  const list = (values || []).slice(0, limit);
  if (!list.length) return null;
  return (
    <div className="hw-chips">
      {list.map((v) => (
        <span className="hw-tag" key={v}>
          {v}
        </span>
      ))}
    </div>
  );
}

function List({ title, items }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <>
      <h2 className="hw-section-title">{title}</h2>
      <ul className="hw-bullets">
        {list.map((item, i) => (
          <li key={i}>{String(item)}</li>
        ))}
      </ul>
    </>
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

export default function StartupJobDetail() {
  const params = useParams();
  const startupKey = decodeURIComponent(params?.key || "");
  const jobId = decodeURIComponent(params?.jobId || "");

  const { data, error, loading, reload } = useApi(
    `/api/jobs?key=${encodeURIComponent(jobId)}`
  );
  const { data: startupData } = useApi(
    `/api/startups?key=${encodeURIComponent(startupKey)}`
  );

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
        <Link className="hw-back" href={`/startups/${encodeURIComponent(startupKey)}`}>
          Back to startup
        </Link>
        <ErrorState
          error={
            error.status === 404 ? { error: "That role was not found." } : error
          }
          onRetry={reload}
        />
      </main>
    );
  }

  const job = data?.job || {};
  const paid = data?.paid === true;
  const company = startupData?.startup || {};
  const links = job.links || {};
  const linkEntries = Object.entries(links).filter(([, v]) => safeHref(v));

  return (
    <main className="hw-main">
      <Link className="hw-back" href={`/startups/${encodeURIComponent(startupKey)}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 12H5m6 6-6-6 6-6"
          />
        </svg>
        {company.name || startupKey}
      </Link>

      <div className="hw-item hw-item--static hw-head">
        <div className="hw-item-top">
          {paid && (
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
          <Avatar src={company.icon} name={company.name} />
          <div style={{ minWidth: 0 }}>
            <h1 className="hw-title" style={{ margin: 0, fontSize: 22 }}>
              {job.job_title || job.name || "Untitled role"}
            </h1>
            {job.job_id && <p className="hw-head-key">{job.job_id}</p>}
            {company.name && <p className="hw-item-sub">{company.name}</p>}
          </div>
        </div>

        <Tags values={job.categories} />
      </div>

      {paid ? (
        <>
          {job.description && (
            <>
              <h2 className="hw-section-title">About the role</h2>
              <div className="hw-card">
                <p style={{ margin: 0 }}>{job.description}</p>
              </div>
            </>
          )}

          <List title="Responsibilities" items={job.responsibilities} />
          <List title="Requirements" items={job.required_skills} />
          <List title="Nice to have" items={job.preferred_skills} />
          <List title="Perks" items={job.perks} />
          <Tags values={job.skills} />

          {linkEntries.length > 0 && (
            <>
              <h2 className="hw-section-title">Apply</h2>
              <div className="hw-apply">
                {linkEntries.map(([k, v]) => (
                  <a
                    className="hw-btn hw-unlock"
                    key={k}
                    href={safeHref(v)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {k}
                  </a>
                ))}
              </div>
            </>
          )}

          <div className="hw-cta">
            <Link className="hw-btn hw-unlock" href={`/jobs/${encodeURIComponent(jobId)}`}>
              Generate roadmap
            </Link>
          </div>
        </>
      ) : (
        <div className="hw-card hw-locked">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 11V8a5 5 0 0 1 10 0v3"
            />
            <rect x="4" y="11" width="16" height="10" rx="2" fill="currentColor" />
          </svg>
          <p className="hw-locked-title">This role is locked</p>
          <p className="hw-locked-text">
            Unlock {company.name || startupKey} to read the full description,
            requirements and application link.
          </p>
          <Link
            className="hw-btn hw-unlock"
            href={`/startups/${encodeURIComponent(startupKey)}`}
          >
            Unlock {company.name || startupKey}
          </Link>
        </div>
      )}
    </main>
  );
}
