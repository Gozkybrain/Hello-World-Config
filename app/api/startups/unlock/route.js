import { NextResponse } from "next/server";
import { unlockStartup } from "@/lib/api";
import { fail, guard } from "../../me/route";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const blocked = guard();
  if (blocked) return blocked;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const key = String(body?.key || "").trim();
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await unlockStartup(key));
  } catch (err) {
    return fail(err);
  }
}
