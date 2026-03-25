import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "No active session" },
      },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, userId: session.userId });
}
