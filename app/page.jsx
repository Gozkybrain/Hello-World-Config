"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { Empty, ErrorState, KeyMissing, Loading } from "@/components/States";

export default function Overview() {
  const me = useApi("/api/me");
  const engines = useApi("/api/engines");

  if (me.loading) return <Loading label="Checking your key" />;

  if (me.error) {
    if (me.error.code === "no_key") {
      return (
        <main className="hw-main">
          <h1 className="hw-title">Hello World</h1>
          <p className="hw-sub">
            Your local control panel for Hello World Jobs.
          </p>
          <KeyMissing error={me.error} />
        </main>
      );
    }
    return (
      <main className="hw-main">
        <ErrorState error={me.error} onRetry={me.reload} />
      </main>
    );
  }

  const user = me.data?.user || {};
  const list = me.data?.roadmaps || [];
  const connected = (engines.data?.engines || []).filter((e) => e.connected);

  return (
    <main className="hw-main">
      <h1 className="hw-title">
        {user.fullName ? `Hello, ${user.fullName.split(" ")[0]}` : "Hello World"}
      </h1>
      <p className="hw-sub">
        Your local control panel. Browse the jobs on your machine, pick an engine,
        and generate a roadmap. Nothing is deployed and nothing is rented.
      </p>

      <div className="hw-grid">
        <div className="hw-card hw-stat">
          <span className="hw-stat-label">Balance</span>
          <span className="hw-stat-value">
            {me.data?.balance ?? 0} <span style={{ fontSize: 15 }}>🐚</span>
          </span>
          <span className="hw-stat-note">Cowrie tokens</span>
        </div>

        <div className="hw-card hw-stat">
          <span className="hw-stat-label">Roadmaps</span>
          <span className="hw-stat-value">{list.length}</span>
          <Link href="/roadmaps" className="hw-stat-note">
            View all
          </Link>
        </div>

        <div className="hw-card hw-stat">
          <span className="hw-stat-label">Engines</span>
          <span className="hw-stat-value">
            {engines.loading ? "…" : connected.length}
          </span>
          <span className="hw-stat-note">
            {connected.length
              ? connected.map((e) => e.provider).join(", ")
              : "None connected yet"}
          </span>
        </div>
      </div>

      {connected.length === 0 && !engines.loading && (
        <>
          <h2 className="hw-section-title">Connect a model</h2>
          <Empty title="No AI engine connected">
            <p>
              Generation needs a model. Connect OpenRouter or Ollama on the Hello
              World setup page, then this panel will pick it up automatically.
            </p>
            <p style={{ marginTop: 10 }}>
              <Link href="/jobs">Browse jobs anyway</Link>
            </p>
          </Empty>
        </>
      )}

      {list.length > 0 && (
        <>
          <h2 className="hw-section-title">Recent</h2>
          <div className="hw-grid">
            {list.slice(0, 6).map((r) => (
              <Link
                key={r.jobId}
                href={`/jobs/${encodeURIComponent(r.jobId)}`}
                className="hw-item"
              >
                <p className="hw-item-title">{r.jobTitle || r.jobId}</p>
                <p className="hw-item-sub">
                  {r.company ? `${r.company} · ` : ""}
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : "saved"}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
