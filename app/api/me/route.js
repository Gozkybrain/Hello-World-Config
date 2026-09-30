import { NextResponse } from "next/server";
import { getMe } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { hasKey } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Turn an ApiError into a response the panel can render without leaking stack traces. */
export function fail(err) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }
  console.error("[config] unexpected error:", err);
  return NextResponse.json(
    { error: "Something went wrong talking to Hello World." },
    { status: 500 }
  );
}

export function guard() {
  if (hasKey()) return null;
  return NextResponse.json(
    {
      error: "No Agent API Key configured.",
      code: "no_key",
      hint: "Add SGK=sgk_... to your .env file, then restart the app.",
    },
    { status: 401 }
  );
}

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;

  try {
    return NextResponse.json(await getMe());
  } catch (err) {
    return fail(err);
  }
}
