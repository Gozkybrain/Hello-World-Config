"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fetch a JSON endpoint from the local proxy. Non-2xx responses resolve to
 * { error, code } so callers can render the message without a try/catch.
 */
export function useApi(path, { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const res = await fetch(path, { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (id !== seq.current) return;
      if (!res.ok) {
        setError(body || { error: `Request failed (${res.status})` });
        setData(null);
      } else {
        setError(null);
        setData(body);
      }
    } catch {
      if (id !== seq.current) return;
      setError({ error: "Could not reach the local app. Is it still running?" });
      setData(null);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    load();
  }, [load, skip]);

  return { data, error, loading, reload: load };
}

/** POST JSON to the local proxy, resolving to { data } or { error }. */
export async function postApi(path, body) {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data || { error: `Request failed (${res.status})` } };
    return { data };
  } catch {
    return { error: { error: "Could not reach the local app." } };
  }
}
