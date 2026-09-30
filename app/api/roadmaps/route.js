import { NextResponse } from "next/server";
import { createRoadmap } from "@/lib/api";
import { fail, guard } from "../me/route";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request) {
  const blocked = guard();
  if (blocked) return blocked;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobId, model, exportToNotion = false } = body || {};
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  try {
    const result = await createRoadmap({ jobId, model, exportToNotion });
    return NextResponse.json(result);
  } catch (err) {
    return fail(err);
  }
}
