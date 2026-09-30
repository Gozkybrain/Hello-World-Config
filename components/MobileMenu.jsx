"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  {
    href: "/",
    label: "Overview",
    icon: (
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
  },
  {
    href: "/jobs",
    label: "Jobs",
    icon: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
  },
  {
    href: "/startups",
    label: "Startups",
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
        <path d="M15 9h2a2 2 0 0 1 2 2v10" />
        <path d="M9 7h2M9 11h2M9 15h2" />
      </>
    ),
  },
  {
    href: "/roadmaps",
    label: "Roadmaps",
    icon: (
      <>
        <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
  },
];

export default function MobileMenu({ open, onClose }) {
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
            return (
              <Link
                key={href}
                className={`sidebar-link${isActive ? " active" : ""}`}
                href={href}
                onClick={onClose}
              >
                <svg
                  className="sidebar-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {icon}
                </svg>
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
