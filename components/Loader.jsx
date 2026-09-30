"use client";

import { useEffect, useState } from "react";

export default function Loader({ hidden = false }) {
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    import("@/styles/loading.css").then(() => setCssLoaded(true));
  }, []);

  return (
    <div
      className={`loader-overlay ${hidden ? "loader-hidden" : ""}`}
      style={!cssLoaded ? { position: "fixed", inset: 0, background: "var(--bg)", zIndex: 9999999999 } : undefined}
    >
      {cssLoaded && (
        <div className="loader-box">
          <div className="loader-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <div className="loader-content">
            <span className="prompt">&gt; </span>
            <span className="text">Please wait...</span>
            <span className="cursor">█</span>
          </div>
        </div>
      )}
    </div>
  );
}
