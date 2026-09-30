import { NextResponse } from "next/server";
import { getStartup, getStartups } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { fail, guard } from "../me/route";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const blocked = guard();
  if (blocked) return blocked;

  const params = request.nextUrl.searchParams;
  const key = params.get("key");

  try {
    if (key) {
      const data = await getStartup(key);
      if (!data?.startup) {
        return NextResponse.json(
          { error: "Startup not found", code: "not_found" },
          { status: 404 }
        );
      }
      return NextResponse.json(data);
    }

    const data = await getStartups({
      search: params.get("search") || "",
      paid: params.get("paid") || "",
      limit: params.get("limit") || "",
    });

    const headers = {};
    if (data?.dailyLimit) headers["X-Startup-Limit"] = String(data.dailyLimit);
    if (data?.refreshAt) headers["X-Startup-Refresh"] = String(data.refreshAt);
    return NextResponse.json(data, { headers });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return NextResponse.json(
        { error: err.message, code: err.code, ...(err.meta || {}) },
        { status: 429 }
      );
    }
    return fail(err);
  }
}