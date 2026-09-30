"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import Markdown from "@/components/Markdown";
import { Empty, ErrorState, KeyMissing, Loading } from "@/components/States";

export default function Roadmaps() {
  const me = useApi("/api/me");

  if (me.loading) {
    return (
      <main className="hw-main">
        <Loading />
      </main>
    );
  }

  if (me.error?.code === "no_key") {
    return (
      <main className="hw-main">
        <h1 className="hw-title">Roadmaps</h1>
        <KeyMissing error={me.error} />
      </main>
    );
  }

  if (me.error) {
    return (
      <main className="hw-main">
        <ErrorState error={me.error} onRetry={me.reload} />
      </main>
    );
  }

  const list = (me.data?.roadmaps || []).slice().sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return (
    <main className="hw-main">
      <h1 className="hw-title">Roadmaps</h1>
      <p className="hw-sub">
        Everything you have generated so far, saved on the Hello World server
        against your key.
      </p>

      {list.length === 0 && (
        <Empty title="Nothing here yet">
          <p>Generate your first roadmap from any job.</p>
          <p style={{ marginTop: 10 }}>
            <Link href="/jobs">Browse jobs</Link>
          </p>
        </Empty>
      )}

      {list.map((r) => (
        <details key={r.jobId}>
          <summary>
            {r.jobTitle || r.jobId}
            {r.company ? (
              <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>
                {r.company}
              </span>
            ) : null}
            {r.createdAt && (
              <span
                style={{
                  color: "var(--text-dim)",
                  fontWeight: 400,
                  fontSize: 12,
                  marginLeft: "auto",
                }}
              >
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            )}
          </summary>

          {r.projects && r.projects.length > 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {(r.projects || []).map((p) => p.name).filter(Boolean).join(" · ")}
            </p>
          )}

          {r.roadmap && <Markdown>{r.roadmap}</Markdown>}

          {r.notionUrl && (
            <p>
              <a href={r.notionUrl} target="_blank" rel="noopener noreferrer">
                Open in Notion
              </a>
            </p>
          )}

          <p>
            <Link href={`/jobs/${encodeURIComponent(r.jobId)}`}>
              Open the job and regenerate
            </Link>
          </p>
        </details>
      ))}
    </main>
  );
}
