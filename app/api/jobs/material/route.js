import { NextResponse } from "next/server";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { guard } from "../../me/route";

export const dynamic = "force-dynamic";

/**
 * Serves the generated Markdown for one job so the panel can display it.
 *
 * Like the save route this is pure filesystem: no upstream call, no Firestore,
 * no quota cost. It only reads what a previous save already wrote, so a role
 * page can render its roadmap without spending anything.
 */
const OUTPUT_ROOT = path.join(process.cwd(), "Jobs");

/** Same restriction as the save route: the id becomes a path segment. */
function safeSegment(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return { error: "jobId is required" };
  if (raw.length > 120) return { error: "jobId is too long" };
  if (raw === "." || raw === "..") return { error: "jobId is not a valid path segment" };
  if (/[/\\]/.test(raw)) return { error: "jobId must not contain slashes" };
  if (raw.includes("\0")) return { error: "jobId contains an illegal character" };
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) {
    return { error: "jobId may only contain letters, numbers, dot, dash and underscore" };
  }
  return { value: raw };
}

/**
 * Front matter is provenance for whoever opens the file on disk. In the panel
 * it would render as a horizontal rule followed by key/value noise, so it is
 * stripped here rather than taught to the markdown renderer.
 */
function stripFrontMatter(text) {
  let out = String(text ?? "");
  while (out.startsWith("---")) {
    const closing = out.indexOf("\n---", 3);
    if (closing === -1) break;
    const afterRule = out.indexOf("\n", closing + 1);
    if (afterRule === -1) break;
    out = out.slice(afterRule + 1).replace(/^\n+/, "");
  }
  return out.trim();
}

async function readIfPresent(filePath) {
  try {
    await access(filePath);
  } catch {
    return null;
  }
  try {
    return stripFrontMatter(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

export async function GET(request) {
  const blocked = guard();
  if (blocked) return blocked;

  const idCheck = safeSegment(new URL(request.url).searchParams.get("jobId"));
  if (idCheck.error) {
    return NextResponse.json({ error: idCheck.error }, { status: 400 });
  }

  const dir = path.join(OUTPUT_ROOT, idCheck.value);
  const [roadmap, proofOfWork] = await Promise.all([
    readIfPresent(path.join(dir, "roadmap.md")),
    readIfPresent(path.join(dir, "proof-of-work.md")),
  ]);

  // Nothing saved for this role yet is a normal state, not a failure, so the
  // caller gets a 200 and decides what to show from the empty fields.
  return NextResponse.json({
    jobId: idCheck.value,
    roadmap,
    proofOfWork,
    hasRoadmap: roadmap !== null,
    hasProofOfWork: proofOfWork !== null,
  });
}