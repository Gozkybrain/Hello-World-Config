"use client";

import { useApi } from "@/lib/useApi";
import { StartupCard } from "@/components/Cards";
import { Empty, ErrorState, KeyMissing, Loading } from "@/components/States";

export default function Favourites() {
  const { data, error, loading, reload } = useApi("/api/startups?paid=1&limit=50");

  if (error?.code === "no_key") {
    return (
      <main className="hw-main hw-starts">
        <h1 className="hw-title">My Favourites</h1>
        <KeyMissing error={error} />
      </main>
    );
  }

  const startups = data?.startups || [];

  return (
    <main className="hw-main hw-starts">
      <h1 className="hw-title">My Favourites</h1>
      <p className="hw-sub">
        Every startup you have unlocked. One payment covers all of that
        company&apos;s roles.
      </p>

      {error && <ErrorState error={error} onRetry={reload} />}

      {loading && <Loading />}

      {!loading && !error && startups.length === 0 && (
        <Empty title="No favourites yet">
          <p>
            Unlock a startup and it will appear here with all of its open roles.
          </p>
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
              {startups.length} unlocked{" "}
              {startups.length === 1 ? "startup" : "startups"}
            </span>
          </div>
        </>
      )}
    </main>
  );
}