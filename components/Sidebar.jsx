"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";
import { NAV_ICONS, NAV_LINKS } from "@/lib/nav";

function NavLinks({ pathname, counts }) {
  return (
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
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;
        setUser(data?.user || null);
        setCounts({
          "/jobs": Array.isArray(data?.applications)
            ? data.applications.length
            : 0,
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <aside className="sidebar-desktop">
        <NavLinks pathname={pathname} counts={counts} />

        <div className="sidebar-foot">
          {user ? (
            <Link href="/" className="sidebar-user">
              <div className="user-dp">
                <img
                  src={user.profilePictureUrl}
                  alt="User avatar"
                  className="avatar-dp"
                  onError={(e) => {
                    e.target.src = "/images/brain.PNG";
                  }}
                />
              </div>
              <span className="sidebar-user-meta">
                <span className="sidebar-user-name">
                  {user.fullName || "Hello World"}
                </span>
                {user.username && (
                  <span className="sidebar-user-handle">@{user.username}</span>
                )}
              </span>
            </Link>
          ) : (
            <span
              className="hw-user-icon"
              title="No Agent API Key configured"
              aria-label="Not signed in"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="20"
                height="20"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          )}
        </div>
      </aside>

      <div className="hw-topbar">
        <Image
          src="/logo.png"
          alt="Hello World"
          className="hw-topbar-logo"
          width={56}
          height={56}
          priority
        />
        <span className="hw-topbar-brand">
          <span>Hello World</span>
          <span>Config</span>
        </span>
        <div className="hw-topbar-actions">
          <ThemeToggle />
          <span
            className="hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setMenuOpen(true);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              width="30"
              height="30"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </span>
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        counts={counts}
      />
    </>
  );
}