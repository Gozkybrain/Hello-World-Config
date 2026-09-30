import { NextResponse } from "next/server";
import { getStartup, getStartups } from "@/lib/api";
import { fail, guard } from "../me/route";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const blocked = guard();
  if (blocked) return blocked;

  const params = request.nextUrl.searchParams;
  const key = params.get("key");

  try {
    if (key) return NextResponse.json(await getStartup(key));
    return NextResponse.json(
      await getStartups({
        limit: params.get("limit") || 10,
        search: params.get("search") || "",
        sort: params.get("sort") || "new",
      })
    );
  } catch (err) {
    return fail(err);
  }
}
