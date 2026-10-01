import { NextResponse } from "next/server";
import { getJob, getJobs } from "@/lib/api";
import { fail, guard } from "../me/route";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const blocked = guard();
  if (blocked) return blocked;

  const params = request.nextUrl.searchParams;
  const key = params.get("key");

  try {
    if (key) return NextResponse.json(await getJob(key));

    return NextResponse.json(
      await getJobs({
        limit: params.get("limit") || 20,
        page: params.get("page") || 1,
        search: params.get("search") || "",
        type: params.get("type") || "",
        startupKey: params.get("startupKey") || "",
      })
    );
  } catch (err) {
    return fail(err);
  }
}
