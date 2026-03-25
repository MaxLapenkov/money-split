"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/validation/common";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import { markSettlementPaid } from "@/lib/queries/settlements";

export async function markSettlementPaidAction(
  settlementId: string,
  groupId: string
): Promise<ActionResult<{ ok: true }>> {
  try {
    await requireSession();
    await markSettlementPaid(settlementId);
    revalidatePath(`/groups/${groupId}`);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }
    console.error("markSettlementPaid error:", err);
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update settlement" },
    };
  }
}
