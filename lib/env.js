import fs from "node:fs";
import path from "node:path";

export const WEB_BASE = "https://helloworldjobs.net";
export const LOCAL_BASE = "http://localhost:3000";

/**
 * Read a .env file without adding a dependency. Next.js loads .env for us in
 * dev and build, but not always at the same time as a plain node process, so
 * this is a fallback for the cases Next misses.
 */
function readDotEnv() {
  const file = path.join(process.cwd(), ".env");
  try {
    const out = {};
    for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

let dotEnvCache = null;
function dotEnv() {
  if (!dotEnvCache) dotEnvCache = readDotEnv();
  return dotEnvCache;
}

/** The Agent API key, or "" when it has not been configured yet. */
export function getKey() {
  const key = process.env.SGK || dotEnv().SGK || "";
  const trimmed = String(key).trim();
  // Treat the placeholder as "not configured" so the panel can say so plainly.
  if (!trimmed || trimmed === "sgk_your_key_here") return "";
  return trimmed;
}

export function hasKey() {
  return getKey().length > 0;
}

/**
 * Candidate API bases, most preferred first. HW_API_BASE disables fallback so a
 * self-hosted deployment is never silently skipped.
 */
export function getBases() {
  const override = process.env.HW_API_BASE || dotEnv().HW_API_BASE;
  if (override) return [String(override).replace(/\/$/, "")];
  return [WEB_BASE, LOCAL_BASE];
}
