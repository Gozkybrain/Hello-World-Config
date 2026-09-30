"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { StartupCard } from "@/components/Cards";
import { Empty, ErrorState, KeyMissing, Loading } from "@/components/States";

function resetWhen(refreshAt) {
  if (!refreshAt) return null;
  const at = new Date(Number(refreshAt));
  if (Number.isNaN(at.getTime())) return null;

  const date = at.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = at.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} at ${time}`;
}

function resetIn(refreshAt, now) {
  const ms = Number(refreshAt) - now;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function Startups() {
  const { data, error, loading, reload } = useApi("/api/startups");
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  if (error?.code === "no_key") {
    return (
      <main className="hw-main hw-starts">
        <h1 className="hw-title">Startups</h1>
        <KeyMissing error={error} />
      </main>
    );
  }

  const startups = data?.startups || [];
  const mapped = data && data.dailyLimit;
  const when = resetWhen(data?.refreshAt);
  const countdown = now ? resetIn(data?.refreshAt, now) : null;

  return (
    <main className="hw-main hw-starts">
      <h1 className="hw-title">Startups</h1>
      <p className="hw-sub">
        {mapped && when
          ? `These are your startup recommendations for today. Your next set arrives ${when}${countdown ? ` (in ${countdown})` : ""}.`
          : "Companies hiring through Hello World right now."}
      </p>

      {error && <ErrorState error={error} onRetry={reload} />}

      {loading && <Loading />}

      {!loading && !error && startups.length === 0 && (
        <Empty title="No startups available">
          <p>Nothing is active right now.</p>
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
              {startups.length} recommended for today
            </span>
          </div>
        </>
      )}
    </main>
  );
}
