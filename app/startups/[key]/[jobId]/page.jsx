"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Cards";
import { ErrorState, KeyMissing, Loading } from "@/components/States";
import Markdown from "@/components/Markdown";
import ProofOfWork from "@/components/ProofOfWork";
import Roadmap from "@/components/Roadmap";

function Chips({ values, limit = 12, className = "hw-tag" }) {
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

// Public origin for outbound apply links. The local apps are previews, so
// anything a candidate should open has to leave the preview host.
const PUBLIC_SITE_ORIGIN = "https://helloworldjobs.net";

const LINK_LABELS = {
  website: "Website",
  twitter: "X",
  x: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
  telegram: "Telegram",
  discord: "Discord",
  whitepaper: "Whitepaper",
  apply: "Apply",
  careers: "Careers",
};

function Block({ title, items }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="hw-raised-block">
      <p className="hw-raised-label">{title}</p>
      <ul className="hw-job-resp">
        {list.map((item, i) => (
          <li key={`${item}-${i}`}>{String(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function MetaRow({ label, value }) {
  if (value === undefined || value === null || value === "" || value === "—") {
    return null;
  }
  return (
    <div
      className="hw-pager"
      style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}
    >
      <span className="hw-pager-note" style={{ margin: 0 }}>
        {label}
      </span>
      <span className="hw-link hw-link--plain">
        {Array.isArray(value) ? value.join(" · ") : String(value)}
      </span>
    </div>
  );
}

function LinkRow({ label, value }) {
  const href = safeHref(value);
  if (!href) return null;
  return (
    <div
      className="hw-pager"
      style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}
    >
      <span className="hw-pager-note" style={{ margin: 0 }}>
        {label}
      </span>
      <a
        className="hw-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {String(value)}
      </a>
    </div>
  );
}

// Only tabs that have saved material get content. The other two still render,
// because "not generated yet" is the honest answer and hiding the tab would
// leave no sign that roadmap and proof-of-work exist as concepts.
const TABS = [
  { id: "info", label: "Info" },
  { id: "roadmap", label: "Roadmap", flag: "hasRoadmap" },
  { id: "pow", label: "Proof of Work", flag: "hasProofOfWork" },
];

function Empty({ title, note }) {
  return (
    <div className="hw-raised-block hw-raised-block--tight">
      <p className="hw-raised-label">{title}</p>
      <p className="hw-person-bio">{note}</p>
    </div>
  );
}

export default function StartupJobDetail() {
  const params = useParams();
  const router = useRouter();
  const startupKey = decodeURIComponent(params?.key || "");
  const jobId = decodeURIComponent(params?.jobId || "");
  const startupHref = `/startups/${encodeURIComponent(startupKey)}`;
  // "Apply Online" always points at the public listing page for this role, not
  // the local preview, so the candidate lands on the real apply surface.
  const applyHref = safeHref(
    `${PUBLIC_SITE_ORIGIN}/startups/${encodeURIComponent(startupKey)}/${encodeURIComponent(jobId)}`
  );

  const { data, error, loading, reload } = useApi(
    `/api/jobs?key=${encodeURIComponent(jobId)}`
  );
  const { data: startupData } = useApi(
    `/api/startups?key=${encodeURIComponent(startupKey)}`
  );

  // Generated material lives on disk in Jobs/<jobId>/. Reading it costs no API
  // quota, so the tabs render whatever was saved rather than anything derived
  // from the live job document.
  const { data: material } = useApi(
    `/api/jobs/material?jobId=${encodeURIComponent(jobId)}`
  );

  const [tab, setTab] = useState("info");
  const hasRoadmap = material?.hasRoadmap === true;
  const hasProofOfWork = material?.hasProofOfWork === true;

  const purchased = data?.purchased === true;
  const needsKey = error?.code === "no_key";

  // A role body only exists for someone who has paid for the parent startup,
  // so everyone else is bounced back to the startup page to unlock it.
  useEffect(() => {
    if (loading || needsKey) return;
    if (!purchased) router.replace(startupHref);
  }, [loading, needsKey, purchased, router, startupHref]);

  if (loading || (!purchased && !needsKey)) {
    return (
      <main className="hw-page">
        <Loading />
      </main>
    );
  }

  if (needsKey) {
    return (
      <main className="hw-page">
        <KeyMissing error={error} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="hw-page">
        <Link className="hw-back" href={startupHref}>
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
  const company = startupData?.startup || {};
  const title = job.job_title || job.name || "Untitled role";
  const attributes = job.attributes || {};
  const linkEntries = Object.entries(job.links || {}).filter(([, v]) =>
    safeHref(v)
  );

  return (
    <main className="hw-page">
      <Link className="hw-back" href={startupHref}>
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

      <div className="hw-item hw-item--static hw-head hw-role-head">
        <div className="hw-item-top">
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
          <Avatar src={company.icon} name={company.name} />
          <div style={{ minWidth: 0 }}>
            <h1 className="hw-title" style={{ margin: 0, fontSize: 22 }}>
              {title}
            </h1>
          </div>
        </div>

        <div className="hw-role-actions">
          <Chips values={job.categories} />

          {applyHref && (
            <a
              className="hw-btn hw-btn--primary"
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="hw-btn-icon"
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
                  d="M7 17 17 7m0 0H8m9 0v9"
                />
              </svg>
              Apply Online
            </a>
          )}
        </div>
      </div>

      <div className="hw-tabs" role="tablist">
        {TABS.map((t) => {
          const empty = t.id !== "info" && !material?.[t.flag];
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`hw-tab${tab === t.id ? " hw-tab--on" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {empty && <span className="hw-tab-flag">Not generated</span>}
            </button>
          );
        })}
      </div>

      {tab === "info" && (
        <div className="hw-tab-panel">
          <div className="hw-raised hw-role-body">
            {job.description && (
              <div className="hw-raised-block hw-raised-block--tight">
                <p className="hw-raised-label">About the role</p>
                <p className="hw-person-bio">{job.description}</p>
              </div>
            )}

            <div className="hw-role-cols">
              <Block title="Responsibilities" items={job.responsibilities} />
              <Block title="Requirements" items={job.required_skills} />
            </div>
            <Block title="Perks" items={job.perks} />

            {(attributes.location || attributes.employment_type) && (
              <div className="hw-raised-block">
                <p className="hw-raised-label">Details</p>
                <div className="hw-links">
                  <MetaRow label="Location" value={attributes.location} />
                  <MetaRow
                    label="Employment type"
                    value={attributes.employment_type}
                  />
                </div>
              </div>
            )}

            {linkEntries.length > 0 && (
              <div className="hw-raised-block">
                <p className="hw-raised-label">Links</p>
                <div className="hw-links">
                  {linkEntries.map(([k, v]) => (
                    <LinkRow
                      key={k}
                      label={LINK_LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1)}
                      value={v}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "roadmap" && (
        <div className="hw-tab-panel">
          <div className="hw-raised hw-role-body">
            {material?.roadmap ? (
              <Roadmap source={material.roadmap} />
            ) : (
              <Empty
                title="Nothing here yet"
                note="This role has no roadmap yet. Ask for one and it will show up here, day by day."
              />
            )}
          </div>
        </div>
      )}

      {tab === "pow" && (
        <div className="hw-tab-panel">
          <div className="hw-raised hw-role-body">
            {material?.proofOfWork ? (
              <ProofOfWork source={material.proofOfWork} />
            ) : (
              <Empty
                title="Nothing here yet"
                note="No project ideas for this role yet. Ask for some and they will show up here, ready to build."
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}