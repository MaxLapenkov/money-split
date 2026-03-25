import { NextRequest, NextResponse } from "next/server";
import { authTelegramInputSchema } from "@/lib/validation/auth";
import {
  validateInitData,
  TelegramAuthError,
} from "@/lib/auth/telegram";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { upsertUser } from "@/lib/queries/users";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = authTelegramInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INVALID_PAYLOAD", message: "initData is required" },
        },
        { status: 400 }
      );
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
        },
        { status: 500 }
      );
    }

    const validated = validateInitData(parsed.data.initData, botToken);

    const displayName = [
      validated.user.first_name,
      validated.user.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    const user = await upsertUser({
      telegramId: String(validated.user.id),
      username: validated.user.username ?? null,
      displayName: displayName || `User ${validated.user.id}`,
    });

    const token = await createSessionToken({
      userId: user.id,
      telegramId: String(validated.user.id),
    });

    await setSessionCookie(token);

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    if (err instanceof TelegramAuthError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_TELEGRAM_SIGNATURE",
            message: err.message,
          },
        },
        { status: 401 }
      );
    }

    console.error("Auth error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
      },
      { status: 500 }
    );
  }
}
