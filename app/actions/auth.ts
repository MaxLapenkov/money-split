"use server";

import type { ActionResult } from "@/lib/validation/common";
import type {
  AuthTelegramInput,
  AuthTelegramSuccess,
} from "@/lib/validation/auth";
import { authTelegramInputSchema } from "@/lib/validation/auth";

export async function authenticateTelegram(
  input: AuthTelegramInput
): Promise<ActionResult<AuthTelegramSuccess>> {
  const parsed = authTelegramInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid auth payload" },
    };
  }

  // TODO: implement Telegram initData validation + session in Phase 2
  return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented yet" } };
}
