"use server";

import { actionError } from "@/lib/errors/action-result";
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
      return actionError("SETTLEMENT_NOT_FOUND", "Перевод не найден");
    }
    if (settlement.status !== "suggested") {
      return actionError(
        settlement.status === "paid"
          ? "SETTLEMENT_ALREADY_PAID"
          : "SETTLEMENT_INVALID_STATE",
        "Перевод уже отмечен или недоступен",
      );
    }

    const group = await getGroupById(groupId);
    if (!group) {
      return actionError("GROUP_NOT_FOUND", "Группа не найдена");
    }

    const isOwner = group.created_by === session.userId;
    const binding = await getBindingForUser(groupId, session.userId);
    const isDebtor =
      binding !== null &&
      binding.group_member_id === settlement.from_group_member_id;

    if (!isOwner && !isDebtor) {
      return actionError(
        "FORBIDDEN_GROUP_ACCESS",
        "Отметить оплату может только организатор или тот, кто переводит по этой строке",
      );
    }

    await markSettlementPaid(settlementId);
    revalidateGroupData(groupId);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return actionError("UNAUTHORIZED", "Требуется авторизация");
    }
    const message = err instanceof Error ? err.message : "";
    if (message === "SETTLEMENT_INVALID_STATE") {
      return actionError(
        "SETTLEMENT_INVALID_STATE",
        "Перевод уже отмечен или недоступен",
      );
    }
    if (message === "SETTLEMENT_NOT_FOUND") {
      return actionError("SETTLEMENT_NOT_FOUND", "Перевод не найден");
    }
    console.error("markSettlementPaid error:", err);
    return actionError("INTERNAL_ERROR", "Не удалось обновить статус");
  }
}
