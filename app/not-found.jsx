"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/loading.css";
import "./not-found.css";
import BackgroundEffect from "@/components/BackgroundEffect";

export default function NotFound() {
  const router = useRouter();
  const [visibleLines, setVisibleLines] = useState([]);
  const [showActions, setShowActions] = useState(false);

  const baseLines = [
    "> 404 NOT FOUND",
    "> Possible reasons:",
    "  - The page does not exist (typo or moved).",
    "  - The route is not part of the control panel."
  ];

  const localHints = [
    "> Try instead:",
    "  - / for the overview",
    "  - /jobs to browse roles",
    "  - /roadmaps for saved work"
  ];

  useEffect(() => {
    const all = [...baseLines, ...localHints];
    let idx = 0;

    const t = setInterval(() => {
      if (idx < all.length) {
        setVisibleLines((prev) => [...prev, all[idx]]);
        idx++;
      } else {
        clearInterval(t);
        setTimeout(() => setShowActions(true), 400);
      }
    }, 200);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const handleGoHome = () => router.push("/");

  return (
    <div className="loader-overlay">
      <BackgroundEffect />
      <div className="loader-box">
        <div className="loader-header">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="loader-content" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div className="terminal-lines">
            <div>404 NOT FOUND</div>
            {visibleLines.map((line, i) => {
              if (!line) return null;
              const hasPrompt = line.startsWith(">");
              return (
                <div key={i}>
                  {hasPrompt && <span className="prompt">&gt;</span>}
                  <span className="text">{line.replace(/^>\s*/, "")}</span>
                </div>
              );
            })}

            {showActions && (
              <div className="terminal-actions">
                <span className="prompt">&gt;</span>{" "}
                <span className="action-link" onClick={handleGoBack}>
                  Go back
                </span>
                <span className="divider"> | </span>
                <span className="action-link" onClick={handleGoHome}>
                  Go home
                </span>
              </div>
            )}

            <span className="cursor">█</span>
          </div>
        </div>
      </div>
    </div>
  );
}
