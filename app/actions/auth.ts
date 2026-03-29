"use server";

import { getSession } from "@/lib/auth/session";
import { actionError } from "@/lib/errors/action-result";
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
    return actionError("UNAUTHORIZED", "Нет активной сессии");
  }

  return { ok: true, userId: session.userId, telegramId: session.telegramId };
}
