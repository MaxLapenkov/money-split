"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/validation/common";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import { markSettlementPaid } from "@/lib/queries/settlements";

export async function markSettlementPaidAction(
  settlementId: string,
  groupId: string,
): Promise<ActionResult<{ ok: true }>> {
  try {
    await requireSession();
    await markSettlementPaid(settlementId);
    revalidatePath(`/groups/${groupId}`);
    return { ok: true };
  } catch (err) {
    console.log(err);
    if (err instanceof AuthRequiredError) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }
    const message = err instanceof Error ? err.message : "";
    if (message === "SETTLEMENT_INVALID_STATE") {
      return {
        ok: false,
        error: {
          code: "SETTLEMENT_INVALID_STATE",
          message: "Перевод уже отмечен или недоступен",
        },
      };
    }
    if (message === "SETTLEMENT_NOT_FOUND") {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Перевод не найден" },
      };
    }
    console.error("markSettlementPaid error:", err);
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update settlement" },
    };
  }
}
