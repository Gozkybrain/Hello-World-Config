"use client";

import Loader from "@/components/Loader";

export function KeyMissing({ error }) {
  return (
    <div className="hw-state hw-state--error">
      <strong>No Agent API Key configured</strong>
      <p>
        {error?.error ||
          "The panel needs your Agent API Key before it can reach Hello World."}
      </p>
      <p style={{ marginTop: 14 }}>
        Create a <code>.env</code> file in this folder with:
      </p>
      <pre className="hw-log" style={{ marginTop: 8, textAlign: "left" }}>
        SGK=sgk_your_key_here
      </pre>
      <p style={{ marginTop: 12 }}>
        Copy the key from the API Key card on the Hello World setup page, paste it
        in place of the placeholder, then restart with <code>npm run dev</code>.
      </p>
    </div>
  );
}

export function Loading() {
  return <Loader />;
}
export function ErrorState({ error, onRetry }) {
  return (
    <div className="hw-state hw-state--error">
      <strong>Something went wrong</strong>
      <p>{error?.error || "Unknown error"}</p>
      {error?.hint && <p style={{ color: "var(--text-dim)" }}>{error.hint}</p>}
      {onRetry && (
        <button type="button" className="hw-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="hw-state">
      <strong>{title}</strong>
      {children}
    </div>
  );
}
