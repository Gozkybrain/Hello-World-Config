import { NextResponse } from "next/server";
import { getEngines } from "@/lib/api";
import { fail, guard } from "../me/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;

  try {
    return NextResponse.json(await getEngines());
  } catch (err) {
    return fail(err);
  }
}
