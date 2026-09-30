"use client";

import Link from "next/link";

/** A company logo, falling back to initials when the icon is missing or broken. */
export function Avatar({ src, name }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  if (!src) return <span className="hw-avatar hw-avatar--ph">{letter}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="hw-avatar"
      src={src}
      alt=""
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const ph = document.createElement("span");
        ph.className = "hw-avatar hw-avatar--ph";
        ph.textContent = letter;
        e.currentTarget.replaceWith(ph);
      }}
    />
  );
}

export function JobCard({ job }) {
  const skills = (job.required_skills || []).slice(0, 4);
  const cats = (job.categories || []).slice(0, 3);

  return (
    <Link href={`/jobs/${encodeURIComponent(job.job_id)}`} className="hw-item">
      <div className="hw-item-top">
        <Avatar src={job.icon} name={job.name || job.job_title} />
        <div style={{ minWidth: 0 }}>
          <p className="hw-item-title">{job.job_title || "Untitled role"}</p>
          <p className="hw-item-sub">{job.name || "Unknown company"}</p>
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
          {(job.required_skills || []).length > 4 && (
            <span className="hw-chip">
              +{(job.required_skills || []).length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function StartupCard({ startup }) {
  return (
    <div className="hw-item" style={{ cursor: "default" }}>
      <div className="hw-item-top">
        <Avatar src={startup.icon} name={startup.name} />
        <div style={{ minWidth: 0 }}>
          <p className="hw-item-title">{startup.name || "Unnamed"}</p>
          <p className="hw-item-sub">
            {startup.jobsCount || 0} open{" "}
            {(startup.jobsCount || 0) === 1 ? "role" : "roles"}
            {startup.oneLiner ? ` · ${startup.oneLiner}` : ""}
          </p>
        </div>
      </div>

      {(startup.categories || []).length > 0 && (
        <div className="hw-chips">
          {(startup.categories || []).slice(0, 4).map((c) => (
            <span className="hw-chip" key={c}>
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
