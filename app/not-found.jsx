import Link from "next/link";

export default function NotFound() {
  return (
    <main className="hw-main">
      <div className="hw-state">
        <strong>Page not found</strong>
        <p>That page is not part of the control panel.</p>
        <p style={{ marginTop: 10 }}>
          <Link href="/">Back to overview</Link>
        </p>
      </div>
    </main>
  );
}
