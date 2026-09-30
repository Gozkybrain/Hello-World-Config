"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { postApi, useApi } from "@/lib/useApi";
import Markdown from "@/components/Markdown";
import { Avatar } from "@/components/Cards";
import { ErrorState, KeyMissing, Loading } from "@/components/States";

function Log({ lines }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  if (lines.length === 0) return null;

  return (
    <div className="hw-log" ref={ref}>
      {lines.map((l, i) => (
        <div key={i} className={`hw-log-line hw-log-line--${l.kind}`}>
          <span className="hw-log-time">{l.at}</span>
          <span className="hw-log-text">{l.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const jobId = decodeURIComponent(id || "");

  const job = useApi(`/api/jobs?key=${encodeURIComponent(jobId)}`);
  const engines = useApi("/api/engines");
  const me = useApi("/api/me");

  const [model, setModel] = useState("");
  const [exportToNotion, setExportToNotion] = useState(false);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState([]);
  const [result, setResult] = useState(null);
  const [genError, setGenError] = useState(null);

  const log = (kind, text) =>
    setLines((prev) => [
      ...prev,
      { kind, text, at: new Date().toLocaleTimeString() },
    ]);

  const engineList = engines.data?.engines || [];
  const balance = me.data?.balance ?? 0;
  const paid = job.data?.paid;
  const alreadyRan = (me.data?.roadmaps || []).some((r) => r.jobId === jobId);
  const canGenerate = !!engineList.length && !running;

  useEffect(() => {
    if (!model && engineList.length) {
      setModel(engineList[0].models?.[0] || "");
    }
  }, [engineList, model]);

  async function generate() {
    setRunning(true);
    setResult(null);
    setGenError(null);
    setLines([]);

    const detail = job.data?.job || {};
    log("step", `Job: ${detail.job_title || jobId}`);
    log("step", `Engine: ${model || "default"}`);
    log("info", "Requesting roadmap from Hello World");

    const started = Date.now();
    const { data, error } = await postApi("/api/roadmaps", {
      jobId,
      model: model || undefined,
      exportToNotion,
    });

    const secs = ((Date.now() - started) / 1000).toFixed(1);

    if (error) {
      log("err", error.error || "Generation failed");
      setGenError(error);
      setRunning(false);
      return;
    }

    log("ok", `Projects: ${(data.projects || []).length}`);
    log("ok", `Guide: ${data.applicationGuide ? "written" : "empty"}`);
    if (data.usedModel) log("info", `Model used: ${data.usedModel}`);
    if (data.fallback) log("info", "Used a fallback model");
    if (data.notionUrl) log("ok", `Exported to Notion: ${data.notionUrl}`);
    if (data.notionError) log("err", `Notion export failed: ${data.notionError}`);
    log("ok", `Done in ${secs}s`);

    setResult(data);
    setRunning(false);
    me.reload();
  }

  if (job.loading) {
    return (
      <main className="hw-main">
        <Loading />
      </main>
    );
  }

  if (job.error?.code === "no_key") {
    return (
      <main className="hw-main">
        <KeyMissing error={job.error} />
      </main>
    );
  }

  if (job.error) {
    return (
      <main className="hw-main">
        <ErrorState error={job.error} onRetry={job.reload} />
      </main>
    );
  }

  const detail = job.data?.job || {};
  const projects = result?.projects || [];
  const skills = detail.required_skills || [];
  const cats = detail.categories || [];

  return (
    <main className="hw-main">
      <div className="hw-item" style={{ cursor: "default" }}>
        <div className="hw-item-top">
          <Avatar src={detail.icon} name={detail.name || detail.job_title} />
          <div style={{ minWidth: 0 }}>
            <h1 className="hw-title" style={{ margin: 0, fontSize: 22 }}>
              {detail.job_title || "Untitled role"}
            </h1>
            <p className="hw-item-sub">
              {detail.name || "Unknown company"}
              {detail.location ? ` · ${detail.location}` : ""}
              {detail.type ? ` · ${detail.type}` : ""}
            </p>
          </div>
        </div>

        {(cats.length > 0 || skills.length > 0) && (
          <div className="hw-chips">
            {cats.map((c) => (
              <span className="hw-chip" key={`c-${c}`}>
                {c}
              </span>
            ))}
            {skills.map((s) => (
              <span className="hw-chip" key={`s-${s}`}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {paid === false && (
        <p
          style={{
            marginTop: 12,
            color: "var(--text-dim)",
            fontSize: 13,
          }}
        >
          The full description unlocks with your first roadmap for this role.
        </p>
      )}

      {detail.description && (
        <>
          <h2 className="hw-section-title">About</h2>
          <div className="hw-card">
            <Markdown>{detail.description}</Markdown>
          </div>
        </>
      )}

      <h2 className="hw-section-title">Generate a roadmap</h2>

      <div className="hw-card">
        <div className="hw-bar" style={{ marginBottom: 12 }}>
          {engineList.length > 0 ? (
            <select
              className="hw-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={running}
            >
              {engineList.map((e) =>
                (e.models || []).map((m) => (
                  <option key={`${e.provider}:${m}`} value={m}>
                    {e.provider} · {m}
                  </option>
                ))
              )}
            </select>
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              No engine connected. Add one on the Hello World setup page.
            </span>
          )}

          <label className="hw-check">
            <input
              type="checkbox"
              checked={exportToNotion}
              onChange={(e) => setExportToNotion(e.target.checked)}
              disabled={running}
            />
            Export to Notion
          </label>

          <button
            type="button"
            className="hw-btn hw-btn--primary"
            onClick={generate}
            disabled={!canGenerate}
          >
            {running && <span className="hw-spin" />}
            {running
              ? "Generating"
              : alreadyRan || paid
                ? "Regenerate"
                : balance >= 25
                  ? "Generate · 25 🐚"
                  : "Generate"}
          </button>
        </div>

        <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 12.5 }}>
          Balance {balance} 🐚.{" "}
          {alreadyRan || paid
            ? "You already have this one, so it is free to run again."
            : "The first run for a role costs 25 🐚, later runs are free."}
        </p>
      </div>

      {lines.length > 0 && (
        <>
          <h2 className="hw-section-title">Activity</h2>
          <Log lines={lines} />
        </>
      )}

      {genError && (
        <>
          <h2 className="hw-section-title">Failed</h2>
          <ErrorState error={genError} onRetry={generate} />
        </>
      )}

      {result && (
        <>
          {result.roadmap && (
            <>
              <h2 className="hw-section-title">Roadmap</h2>
              <div className="hw-card">
                <Markdown>{result.roadmap}</Markdown>
              </div>
            </>
          )}

          {projects.length > 0 && (
            <>
              <h2 className="hw-section-title">Proof of work</h2>
              {projects.map((p, i) => (
                <details key={i} open={i === 0}>
                  <summary>
                    {p.name || `Project ${i + 1}`}
                    {p.recommended && (
                      <span className="hw-chip hw-chip--paid">Recommended</span>
                    )}
                  </summary>
                  {p.why && <Markdown>{p.why}</Markdown>}
                  {(p.skills || []).length > 0 && (
                    <div className="hw-chips">
                      {p.skills.map((s) => (
                        <span className="hw-chip" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </details>
              ))}
            </>
          )}

          {result.applicationGuide && (
            <>
              <h2 className="hw-section-title">Application guide</h2>
              <div className="hw-card">
                <Markdown>{result.applicationGuide}</Markdown>
              </div>
            </>
          )}

          {result.notionUrl && (
            <p style={{ marginTop: 16 }}>
              <a
                href={result.notionUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Notion
              </a>
            </p>
          )}
        </>
      )}
    </main>
  );
}
