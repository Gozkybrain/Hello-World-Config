"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { JobCard } from "@/components/Cards";
import { Empty, ErrorState, KeyMissing, Loading } from "@/components/States";

const TYPES = ["", "fulltime", "parttime", "internship", "contract"];

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  // Debounce so typing does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams({ limit: "24", page: String(page) });
  if (query) params.set("search", query);
  if (type) params.set("type", type);

  const { data, error, loading, reload } = useApi(`/api/jobs?${params}`);

  if (error?.code === "no_key") {
    return (
      <main className="hw-main">
        <h1 className="hw-title">Jobs</h1>
        <KeyMissing error={error} />
      </main>
    );
  }

  const jobs = data?.jobs || [];
  const total = data?.total || 0;

  return (
    <main className="hw-main">
      <h1 className="hw-title">Jobs</h1>
      <p className="hw-sub">
        Every live role on Hello World. Open one to read the full description and
        generate a roadmap against it.
      </p>

      <div className="hw-bar">
        <input
          className="hw-input"
          placeholder="Search roles, companies, skills"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="hw-select"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          {TYPES.map((t) => (
            <option key={t || "all"} value={t}>
              {t ? t : "All types"}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}

      {loading && <Loading label="Loading jobs" />}

      {!loading && !error && jobs.length === 0 && (
        <Empty title="No jobs matched">
          <p>Try a different search or clear the filter.</p>
        </Empty>
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          <div className="hw-grid">
            {jobs.map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>

          <div
            className="hw-bar"
            style={{ marginTop: 24, justifyContent: "space-between" }}
          >
            <span style={{ color: "var(--text-dim)", fontSize: 13 }}>
              {total} {total === 1 ? "job" : "jobs"}
              {query ? ` matching "${query}"` : ""}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="hw-btn hw-btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span
                className="hw-btn hw-btn--sm"
                style={{ pointerEvents: "none" }}
              >
                Page {page}
              </span>
              <button
                type="button"
                className="hw-btn hw-btn--sm"
                disabled={!data?.hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
