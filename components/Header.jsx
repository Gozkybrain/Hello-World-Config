"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/jobs", label: "Jobs" },
  { href: "/startups", label: "Startups" },
  { href: "/roadmaps", label: "Roadmaps" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive) setUser(data?.user || null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <header className="head-user">
        <Link href="/" className="header-logo-wrapper">
          <Image
            src="/logo.png"
            alt="Hello World Jobs"
            className="header-logo"
            width={65}
            height={65}
            priority
          />
          <div className="header-brand">
            <span className="header-brand-line">Hello World</span>
            <span className="header-brand-line">Config</span>
          </div>
        </Link>

        <div className="header-actions">
          <nav className="header-links" aria-label="Panel">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  className={`header-link${isActive ? " header-link--active" : ""}`}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <div className="users-menu">
              <a href="/" aria-label="Go to overview">
                <div className="user-dp" style={{ position: "relative" }}>
                  <img
                    src={user.profilePictureUrl}
                    alt="User avatar"
                    className="avatar-dp"
                    onError={(e) => {
                      e.target.src = "/images/brain.PNG";
                    }}
                  />
                </div>
              </a>
            </div>
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

          <ThemeToggle />

          <span
            className="hamburger mobile-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            role="button"
            tabIndex={0}
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
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
