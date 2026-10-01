import { getBases, getKey } from "./env";

export class ApiError extends Error {
  constructor(message, { status = 500, code = null, meta = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.meta = meta;
  }
}

/**
 * Call the Hello World v1 Agent API. The key is attached here, on the server,
 * so it never reaches the browser.
 *
 * Bases are tried in order. The public deployment is preferred; a local dev
 * server is used as a fallback so the panel keeps working when you are running
 * the jobs app yourself.
 */
async function call(pathname, { method = "GET", body, signal } = {}) {
  const key = getKey();
  if (!key) {
    throw new ApiError(
      "No Agent API Key configured. Add SGK to your .env file and restart the app.",
      { status: 401, code: "no_key" }
    );
  }

  const bases = getBases();
  let lastError = null;

  for (const base of bases) {
    const url = `${base}${pathname}`;
    try {
      const res = await fetch(url, {
        method,
        signal,
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      // A 404 from a given base means "wrong server" for some paths, so treat
      // network-level misses as fallback-eligible but auth failures as final.
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (res.ok) return data;

      if (res.status === 401 || res.status === 403) {
        throw new ApiError(
          data?.error || "Your Agent API Key was rejected.",
          { status: 401, code: "bad_key" }
        );
      }

      if (res.status === 429) {
        throw new ApiError(
          data?.error || "You have hit the daily limit for this endpoint.",
          {
            status: 429,
            code: data?.code || "rate_limited",
            meta: {
              limit: data?.limit ?? null,
              remaining: data?.remaining ?? 0,
              resetAt: data?.resetAt ?? null,
            },
          }
        );
      }

      if (res.status === 503) {
        throw new ApiError(
          data?.error || "The Hello World API is temporarily unavailable.",
          { status: 503, code: "maintenance" }
        );
      }

      lastError = new ApiError(data?.error || `Request failed (${res.status})`, {
        status: res.status,
        code: data?.code || data?.error || "http_error",
      });

      // Only try the next base for errors that look like the wrong server.
      if (res.status === 404 || res.status >= 500) continue;
      throw lastError;
    } catch (err) {
      if (
        err instanceof ApiError &&
        ["bad_key", "maintenance", "startup_limit_reached", "rate_limited"].includes(err.code)
      ) {
        throw err;
      }
      lastError =
        err instanceof ApiError
          ? err
          : new ApiError(`Could not reach ${base}. Is it running?`, {
              status: 502,
              code: "unreachable",
            });
    }
  }

  throw lastError || new ApiError("Could not reach the Hello World API.");
}

function qs(params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function getMe() {
  return call("/api/v1/me");
}

export function getEngines() {
  return call("/api/v1/me/ai");
}

export function getJobs({ limit = 20, page = 1, search, type, startupKey } = {}) {
  return call(`/api/v1/jobs${qs({ limit, page, search, type, startupKey })}`);
}

export function getJob(jobId) {
  return call(`/api/v1/jobs${qs({ key: jobId })}`);
}

export function getStartups({ search, paid, limit } = {}) {
  return call(`/api/v1/startups${qs({ search, paid, limit, sort: paid ? "recent" : undefined })}`);
}

export function getStartup(key) {
  return call(`/api/v1/startups${qs({ key })}`);
}

export function unlockStartup(key) {
  return call("/api/v1/startups/unlock", {
    method: "POST",
    body: { key },
  });
}

export function createRoadmap({ jobId, model, exportToNotion = false, apiKey }) {
  return call("/api/v1/roadmaps", {
    method: "POST",
    body: { jobId, model, exportToNotion, apiKey },
  });
}
