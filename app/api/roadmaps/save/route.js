import { NextResponse } from "next/server";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { guard } from "../../me/route";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Where generated role material lands, relative to the repo root.
 *
 * This is the whole point of the route: it never calls the upstream API and
 * never touches Firestore. Generation is the expensive step (reads the job
 * document, reads the user profile, then writes a record), so the save must be
 * free -- otherwise every save spends quota re-reading data we already have.
 * The agent calls `/api/roadmaps` once to generate, then this route as often as
 * it likes.
 */
const OUTPUT_ROOT = path.join(process.cwd(), "Jobs");

const MANIFEST = "index.json";

/**
 * Reject anything that could escape the output directory. These segments come
 * straight from a request body and are used to build a filesystem path, so
 * traversal has to be refused rather than escaped.
 */
function safeSegment(value, label) {
  const raw = String(value ?? "").trim();
  if (!raw) return { error: `${label} is required` };
  if (raw.length > 120) return { error: `${label} is too long` };
  if (raw === "." || raw === "..") return { error: `${label} is not a valid path segment` };
  if (/[/\\]/.test(raw)) return { error: `${label} must not contain slashes` };
  if (raw.includes("\0")) return { error: `${label} contains an illegal character` };
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) {
    return { error: `${label} may only contain letters, numbers, dot, dash and underscore` };
  }
  return { value: raw };
}

/**
 * Normalise to text with no trailing whitespace.
 *
 * Callers routinely hand back a file we previously wrote, which already ends in
 * a newline. Without this, the write path appends its own newline and every save
 * grows the file by a blank line.
 */
function normalize(text) {
  return String(text ?? "").replace(/\s+$/, "");
}

function asText(value) {
  if (typeof value === "string") return normalize(value);
  if (Array.isArray(value)) {
    // Tolerate structured project output so a caller does not have to flatten it.
    return normalize(
      value
        .map((entry) => {
          if (typeof entry === "string") return entry;
          if (!entry || typeof entry !== "object") return "";
          const name = entry.name || entry.title || "Untitled";
          const why = entry.why || entry.description || "";
          const skills = Array.isArray(entry.skills) ? entry.skills.join(", ") : entry.skills;
          const tag = entry.recommended ? " (recommended)" : "";
          return [`## ${name}${tag}`, why, skills ? `Skills: ${skills}` : ""]
            .filter(Boolean)
            .join("\n\n");
        })
        .filter(Boolean)
        .join("\n\n")
    );
  }
  if (value && typeof value === "object") return normalize(JSON.stringify(value, null, 2));
  return "";
}

/** Front matter so a file opened months later explains itself. */
function header({ jobTitle, startupName, jobId, startupKey, model, generatedAt }) {
  const lines = ["---", `job_id: ${jobId}`];
  // Omit empty fields rather than writing `key:` with nothing after it.
  if (startupKey) lines.push(`startup_key: ${startupKey}`);
  if (jobTitle) lines.push(`job_title: ${JSON.stringify(jobTitle)}`);
  if (startupName) lines.push(`startup_name: ${JSON.stringify(startupName)}`);
  if (model) lines.push(`model: ${JSON.stringify(model)}`);
  lines.push(`generated_at: ${generatedAt}`);
  lines.push("source: POST /api/v1/roadmaps");
  lines.push("---", "");
  return lines.join("\n");
}

/** Drop every leading front-matter block so a re-save cannot nest them. */
function stripAllFrontMatter(text) {
  let out = String(text ?? "");
  while (out.startsWith("---")) {
    const closing = out.indexOf("\n---", 3);
    if (closing === -1) break;
    const afterRule = out.indexOf("\n", closing + 1);
    if (afterRule === -1) break;
    out = out.slice(afterRule + 1).replace(/^\n+/, "");
  }
  return out.trimEnd();
}

async function readManifest() {
  try {
    const raw = await readFile(path.join(OUTPUT_ROOT, MANIFEST), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.entries) return parsed;
  } catch {
    // No manifest yet, or it was hand-edited into bad JSON. Either way we
    // rebuild rather than failing the save.
  }
  return { updatedAt: null, entries: {} };
}

/** True when a path exists. Used to report real state instead of intent. */
async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Merge one entry into the manifest with a read-modify-write. Sequential
 * saves from one agent are fine; this is a local panel, not a write broker.
 *
 * Only fields the caller actually supplied are overwritten. A save that carries
 * just the proof-of-work must not erase the job title recorded by an earlier
 * roadmap save.
 */
async function writeManifest(manifest, key, entry) {
  manifest.updatedAt = new Date().toISOString();
  const prior = manifest.entries[key] || {};
  manifest.entries[key] = { ...prior, ...entry };
  await writeFile(
    path.join(OUTPUT_ROOT, MANIFEST),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
}

/** Drop the leading front matter block so two files can be compared by body. */
function stripFrontMatter(text) {
  if (!text.startsWith("---")) return text;
  const closing = text.indexOf("\n---", 3);
  if (closing === -1) return text;
  const afterRule = text.indexOf("\n", closing + 1);
  if (afterRule === -1) return text;
  return text.slice(afterRule + 1);
}

/**
 * Skip the write when the body is unchanged, so re-saving identical output does
 * not churn the disk. The comparison ignores front matter on purpose: a fresh
 * `generated_at` would otherwise make every save look like a change and would
 * overwrite the timestamp of the run that actually produced the content.
 */
async function writeIfChanged(filePath, contents, body) {
  try {
    const current = await readFile(filePath, "utf8");
    if (stripFrontMatter(current) === body) return { path: filePath, changed: false };
  } catch {
    // New file.
  }
  await writeFile(filePath, contents, "utf8");
  return { path: filePath, changed: true };
}

export async function POST(request) {
  const blocked = guard();
  if (blocked) return blocked;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    jobId,
    startupKey,
    jobTitle,
    startupName,
    model,
    roadmap,
    applicationGuide,
    projects,
    proofOfWork,
  } = body || {};

  const idCheck = safeSegment(jobId, "jobId");
  if (idCheck.error) {
    return NextResponse.json({ error: idCheck.error }, { status: 400 });
  }
  // `startupKey` is metadata only. It does not appear in the path, so one job
  // folder is exactly `Jobs/<jobId>/`.
  let startup = "";
  if (startupKey) {
    const keyCheck = safeSegment(startupKey, "startupKey");
    if (keyCheck.error) {
      return NextResponse.json({ error: keyCheck.error }, { status: 400 });
    }
    startup = keyCheck.value;
  }

  // `roadmap` is the role snapshot, `applicationGuide` is the generated
  // strategy. Either can stand alone so a caller can save one piece.
  // Front matter is stripped first: re-saving a file we previously wrote must
  // replace its header, not stack a second one inside the body.
  const guide = stripAllFrontMatter(asText(applicationGuide));
  const snapshot = stripAllFrontMatter(asText(roadmap));
  const pow = stripAllFrontMatter(asText(proofOfWork) || asText(projects));

  if (!guide && !snapshot && !pow) {
    return NextResponse.json(
      {
        error:
          "Nothing to save. Send `roadmap` and/or `applicationGuide` and/or `projects` (alias: proofOfWork).",
      },
      { status: 400 }
    );
  }

  const generatedAt = new Date().toISOString();
  const dir = path.join(OUTPUT_ROOT, idCheck.value);
  const meta = {
    jobTitle: asText(jobTitle) || "",
    startupName: asText(startupName) || "",
    model: asText(model) || "",
    generatedAt,
  };
  const front = header({
    jobTitle: meta.jobTitle,
    startupName: meta.startupName,
    jobId: idCheck.value,
    startupKey: startup,
    model: meta.model,
    generatedAt,
  });

  const written = [];
  try {
    await mkdir(dir, { recursive: true });

    if (guide || snapshot) {
      const parts = [];
      if (guide) parts.push(guide);
      if (snapshot) {
        parts.push(`## Role snapshot\n\n${snapshot}`);
      }
      const body = `${parts.join("\n\n")}\n`;
      written.push(
        await writeIfChanged(path.join(dir, "roadmap.md"), `${front}${body}`, body)
      );
    }

    if (pow) {
      const body = `${pow}\n`;
      written.push(
        await writeIfChanged(
          path.join(dir, "proof-of-work.md"),
          `${front}${body}`,
          body
        )
      );
    }

    // Per-job meta doubles as "has this been generated yet?", which lets the
    // agent check the filesystem instead of spending a read on the API. It
    // merges rather than replaces so a partial save cannot drop file entries.
    const metaPath = path.join(dir, "meta.json");
    const priorMeta = await readJson(metaPath);
    const files = {
      ...(priorMeta.files && typeof priorMeta.files === "object" ? priorMeta.files : {}),
    };
    for (const entry of written) {
      files[path.basename(entry.path)] = path.relative(OUTPUT_ROOT, entry.path);
    }
    const merged = {
      ...priorMeta,
      jobId: idCheck.value,
      startupKey: startup,
      jobTitle: meta.jobTitle || priorMeta.jobTitle || "",
      startupName: meta.startupName || priorMeta.startupName || "",
      model: meta.model || priorMeta.model || "",
      firstGeneratedAt: priorMeta.firstGeneratedAt || generatedAt,
      updatedAt: generatedAt,
      files,
    };
    await writeFile(metaPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

    const manifest = await readManifest();
    const manifestKey = idCheck.value;
    await writeManifest(manifest, manifestKey, {
      jobTitle: merged.jobTitle,
      startupName: merged.startupName,
      model: merged.model,
      firstGeneratedAt: merged.firstGeneratedAt,
      updatedAt: merged.updatedAt,
      // Report what is on disk, not what this request happened to include.
      hasRoadmap: await exists(path.join(dir, "roadmap.md")),
      hasProofOfWork: await exists(path.join(dir, "proof-of-work.md")),
      dir: path.relative(OUTPUT_ROOT, dir),
    });
  } catch (err) {
    console.error("[config] roadmap save failed:", err);
    return NextResponse.json(
      { error: "Could not write the roadmap files.", detail: err.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "saved",
    changed: written.some((entry) => entry.changed),
    jobId: idCheck.value,
    startupKey: startup,
    dir: path.relative(process.cwd(), dir),
    files: written.map((entry) => path.relative(process.cwd(), entry.path)),
  });
}