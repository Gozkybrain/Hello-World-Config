"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { Empty, ErrorState, KeyMissing, Loading } from "@/components/States";

function FaGithub(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="currentColor">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function FaGlobe(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function FaTwitter(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="currentColor">
      <path d="M23 4.9c-.8.4-1.7.6-2.6.8a4.5 4.5 0 0 0 2-2.5c-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 2.6 3.7a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6 4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 1 19.1a12.7 12.7 0 0 0 6.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.2-2.3z" />
    </svg>
  );
}

export default function Overview() {
  const me = useApi("/api/me");
  const engines = useApi("/api/engines");

  if (me.loading) return <Loading />;

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
  const stack = (user.techStack || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const links = [
    user.github && { icon: <FaGithub />, value: user.github, href: user.github },
    user.portfolio && { icon: <FaGlobe />, value: user.portfolio, href: user.portfolio },
    user.username && {
      icon: <FaTwitter />,
      value: `@${user.username}`,
      href: `https://twitter.com/${user.username}`,
    },
  ].filter(Boolean);

  return (
    <main className="hw-main">
      <div className="twitter-profile-container">
        <div className="twitter-banner" />

        <div className="twitter-profile-section">
          <div className="twitter-profile-pic-container">
            <div className="twitter-profile-pic">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.fullName || "Profile"}
                  onError={(e) => {
                    e.target.src = "/images/brain.PNG";
                  }}
                />
              ) : (
                <div className="twitter-profile-pic-placeholder">
                  {user.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="twitter-header-actions">
              <div className="twitter-stat">
                <strong>Balance:</strong>{" "}
                {Number(me.data?.balance ?? 0).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                🐚
              </div>
            </div>
          </div>

          <div className="twitter-profile-info">
            <h2 className="twitter-display-name">{user.fullName || "Hello World"}</h2>
            {user.username && <div className="twitter-username">@{user.username}</div>}
          </div>
        </div>

        <div className="twitter-tab-content">
          <div className="twitter-about-section">
            <div style={{ padding: "0 16px" }}>
              <h3
                style={{
                  color: "var(--text)",
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                Personal Info
              </h3>
              <div className="twitter-info-grid">
                <div className="twitter-info-row">
                  <span className="twitter-about-label">Tech Role</span>
                  <span className="twitter-about-value">{user.rank || "Rookie"}</span>
                </div>
              </div>

              <div style={{ padding: "16px 0 0" }}>
                <h4
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  Tech Stack
                </h4>
                {stack.length > 0 ? (
                  <div className="twitter-tech-stack">
                    {stack.map((tech, i) => (
                      <span key={i} className="twitter-tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="twitter-about-value">Not set</span>
                )}
              </div>
            </div>

            {links.length > 0 && (
              <>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--border)",
                    margin: "24px 0",
                  }}
                />

                <div style={{ padding: "0 16px" }}>
                  <h3
                    style={{
                      color: "var(--text)",
                      fontSize: "18px",
                      fontWeight: "700",
                      marginBottom: "16px",
                    }}
                  >
                    Links
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {links.map((l) => (
                      <a
                        key={l.value}
                        className="twitter-link-item"
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {l.icon} <span>{l.value}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
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
