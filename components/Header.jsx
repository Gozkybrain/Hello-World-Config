"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/jobs", label: "Jobs" },
  { href: "/startups", label: "Startups" },
  { href: "/roadmaps", label: "Roadmaps" },
];

export default function Header() {
  const pathname = usePathname();
  const [keyOk, setKeyOk] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => {
        if (!alive) return;
        setKeyOk(r.ok);
      })
      .catch(() => {
        if (alive) setKeyOk(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <header className="hw-header">
      <Link href="/" className="hw-brand">
        <span className="hw-logo">HW</span>
        <span>Hello World</span>
      </Link>

      <nav className="hw-nav">
        {LINKS.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={active ? "active" : ""}>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <span
        className="hw-key-state"
        title={
          keyOk === false
            ? "No Agent API Key configured. Add SGK to .env and restart."
            : "Agent API Key loaded from .env"
        }
      >
        <span
          className={`hw-dot ${keyOk === true ? "hw-dot--on" : keyOk === false ? "hw-dot--off" : ""}`}
        />
        <span>{keyOk === null ? "Checking" : keyOk ? "Key loaded" : "No key"}</span>
      </span>
    </header>
  );
}
