"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  const syncThemeToDOM = (currentTheme) => {
    document.documentElement.dataset.theme = currentTheme;
    document.documentElement.style.colorScheme = currentTheme;
    const color = currentTheme === "light" ? "#fafafa" : "#09090b";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  };

  useEffect(() => {
    const stored = localStorage.getItem("hw-theme");
    let initial = stored;
    if (!initial) {
      initial = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    setTheme(initial);
    syncThemeToDOM(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("hw-theme", next);
    syncThemeToDOM(next);
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle light / dark theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  );
}