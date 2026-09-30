export const NAV_ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
  startups: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  jobs: (
    <>
      <circle cx="12" cy="6" r="3.5" />
      <path d="M5 21v-1a5 5 0 0 1 5-5" />
      <path d="M19 21v-1a5 5 0 0 0-5-5" />
      <path d="M9.5 11.5 12 15l2.5-3.5" />
      <path d="M12 15l-1.3 2h2.6z" />
      <path d="M10.7 17h2.6l.7 3.5h-4z" />
    </>
  ),
};

export const NAV_LINKS = [
  { href: "/", label: "Overview", icon: "dashboard" },
  { href: "/favourites", label: "My Favourites", icon: "jobs" },
  { href: "/startups", label: "Startups", icon: "startups" },
];