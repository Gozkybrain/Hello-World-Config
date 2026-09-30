"use client";

import { useParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Cards";
import { ErrorState, KeyMissing, Loading } from "@/components/States";

function Chips({ values, limit = 8 }) {
  const list = (values || []).slice(0, limit);
  if (!list.length) return null;
  return (
    <div className="hw-chips">
      {list.map((v) => (
        <span className="hw-chip" key={v}>
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

export default function StartupDetail() {
  const { key } = useParams();
  const startupKey = decodeURIComponent(key || "");

  const { data, error, loading, reload } = useApi(
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

  return (
    <main className="hw-main">
      <div className="hw-item" style={{ cursor: "default" }}>
        <div className="hw-item-top">
          <Avatar src={s.icon} name={s.name} />
          <div style={{ minWidth: 0 }}>
            <h1 className="hw-title" style={{ margin: 0, fontSize: 22 }}>
              {s.name || "Unnamed"}
            </h1>
            <p className="hw-item-sub">
              {jobs} open {jobs === 1 ? "role" : "roles"}
              {s.country ? ` · ${s.country}` : ""}
            </p>
          </div>
        </div>

        <Chips values={s.categories} />
      </div>

      {s.description && (
        <>
          <h2 className="hw-section-title">About</h2>
          <div className="hw-card">
            <p style={{ margin: 0 }}>{s.description}</p>
          </div>
        </>
      )}

      <h2 className="hw-section-title">Details</h2>
      <div className="hw-card">
        <Row label="Listed" value={s.date} />
        <Row label="Symbol" value={s.symbol} />
        <Row label="Website" value={links.website} />
        <Row label="X" value={links.twitter} />
        <Row label="GitHub" value={links.github} />
        <Row label="Whitepaper" value={links.whitepaper} />
        <Row
          label="Raised"
          value={s.fundraising?.total_raised || "—"}
        />
      </div>

      <Chips values={s.skills} limit={14} />
    </main>
  );
}
