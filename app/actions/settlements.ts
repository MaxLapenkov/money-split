"use server";

import type { ActionResult } from "@/lib/validation/common";
import { revalidateGroupData } from "@/lib/cache/revalidate";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import { getBindingForUser } from "@/lib/queries/bindings";
import { getGroupById } from "@/lib/queries/groups";
import {
  getSettlementById,
  markSettlementPaid,
} from "@/lib/queries/settlements";

export async function markSettlementPaidAction(
  settlementId: string,
  groupId: string,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const session = await requireSession();

    const settlement = await getSettlementById(settlementId);
    if (!settlement || settlement.group_id !== groupId) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Перевод не найден" },
      };
    }
    if (settlement.status !== "suggested") {
      return {
        ok: false,
        error: {
          code: "SETTLEMENT_INVALID_STATE",
          message: "Перевод уже отмечен или недоступен",
        },
      };
    }

    const group = await getGroupById(groupId);
    if (!group) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Группа не найдена" },
      };
    }

    const isOwner = group.created_by === session.userId;
    const binding = await getBindingForUser(groupId, session.userId);
    const isDebtor =
      binding !== null &&
      binding.group_member_id === settlement.from_group_member_id;

    if (!isOwner && !isDebtor) {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Отметить оплату может только организатор или тот, кто переводит по этой строке",
        },
      };
    }

    await markSettlementPaid(settlementId);
    revalidateGroupData(groupId);
    return { ok: true };
  } catch (err) {
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
