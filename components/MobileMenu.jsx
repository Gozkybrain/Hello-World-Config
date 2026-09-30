"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS, NAV_LINKS } from "@/lib/nav";

export default function MobileMenu({ open, onClose, counts = {} }) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <aside className="sidebar-mobile open">
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>

        <nav className="sidebar-nav">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            const count = counts[href];
            return (
              <Link
                key={href}
                className={`sidebar-link${isActive ? " active" : ""}`}
                href={href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
              >
                <svg
                  className="sidebar-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  {NAV_ICONS[icon] || icon}
                </svg>
                <span>{label}</span>
                {count != null && <span className="sidebar-count">{count}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}