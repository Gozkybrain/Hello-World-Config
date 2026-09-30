"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { StartupCard } from "@/components/Cards";
import { Empty, ErrorState, KeyMissing, Loading } from "@/components/States";

const MAX_LIMIT = 50;

export default function Startups() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("new");
  const [limit, setLimit] = useState(30);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLimit(30);
  }, [query, sort]);

  const params = new URLSearchParams({ limit: String(limit), sort });
  if (query) params.set("search", query);

  const { data, error, loading, reload } = useApi(`/api/startups?${params}`);

  if (error?.code === "no_key") {
    return (
      <main className="hw-main">
        <h1 className="hw-title">Startups</h1>
        <KeyMissing error={error} />
      </main>
    );
  }

  const startups = data?.startups || [];

  return (
    <main className="hw-main">
      <h1 className="hw-title">Startups</h1>
      <p className="hw-sub">
        Companies hiring through Hello World right now, with how many roles each
        one has open.
      </p>

      <div className="hw-bar">
        <input
          className="hw-input"
          placeholder="Search companies"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="hw-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="new">Newest first</option>
          <option value="random">Shuffled</option>
        </select>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}

      {loading && <Loading />}

      {!loading && !error && startups.length === 0 && (
        <Empty title="No startups matched">
          <p>Try a different search.</p>
        </Empty>
      )}

      {!loading && !error && startups.length > 0 && (
        <>
          <div className="hw-grid">
            {startups.map((s) => (
              <StartupCard key={s.key || s.name} startup={s} />
            ))}
          </div>

          <div className="hw-pager">
            <span className="hw-pager-count">
              Showing {startups.length} of {data?.total || startups.length}{" "}
              companies tracked
            </span>

            {sort === "new" ? (
              startups.length < Math.min(data?.total || 0, MAX_LIMIT) ? (
                <button
                  className="hw-btn"
                  onClick={() =>
                    setLimit((n) => Math.min(n + 20, MAX_LIMIT))
                  }
                  disabled={loading}
                >
                  Load 20 more
                </button>
              ) : (data?.total || 0) > MAX_LIMIT ? (
                <span className="hw-pager-note">
                  The API returns at most {MAX_LIMIT} at a time. Search to reach
                  the other {(data?.total || 0) - MAX_LIMIT}.
                </span>
              ) : null
            ) : (
              <span className="hw-pager-note">
                Shuffled view shows a random set. Switch to Newest first to page
                through everything.
              </span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
