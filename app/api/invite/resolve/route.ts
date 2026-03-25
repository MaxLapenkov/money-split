import { NextRequest, NextResponse } from "next/server";
import { resolveInviteInputSchema } from "@/lib/validation/invite";
import { resolveInviteToken } from "@/lib/queries/invite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resolveInviteInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid invite token",
          },
        },
        { status: 400 }
      );
    }

    const invite = await resolveInviteToken(parsed.data.inviteToken);

    if (!invite) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INVITE_NOT_FOUND", message: "Invalid invite link" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, groupId: invite.group_id });
  } catch (err) {
    console.error("Invite resolve error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
      },
      { status: 500 }
    );
  }
}
