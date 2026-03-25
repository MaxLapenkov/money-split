"use server";

import { getSession } from "@/lib/auth/session";
import type { ApiError } from "@/lib/validation/common";

interface SessionResult {
  userId: string;
  telegramId: string;
}

export async function getSessionAction(): Promise<
  { ok: true } & SessionResult | ApiError
> {
  const session = await getSession();

  if (!session) {
    return {
      ok: false,
      error: { code: "UNAUTHORIZED", message: "No active session" },
    };
  }

  return { ok: true, userId: session.userId, telegramId: session.telegramId };
}
