"use server";

import { actionError } from "@/lib/errors/action-result";
import type { ActionResult } from "@/lib/validation/common";
import { revalidateGroupData } from "@/lib/cache/revalidate";
import type { CreateExpenseInput } from "@/lib/validation/expenses";
import { createExpenseInputSchema } from "@/lib/validation/expenses";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import { buildEqualSplitAmounts } from "@/lib/equal-split";
import {
  countExpensesInGroup,
  createExpenseWithSplits,
} from "@/lib/queries/expenses";

export async function createExpense(
  groupId: string,
  input: CreateExpenseInput
): Promise<ActionResult<{ ok: true; expenseId: string }>> {
  try {
    const session = await requireSession();

    const parsed = createExpenseInputSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        "INVALID_EXPENSE_PAYLOAD",
        "Проверьте поля расхода или поступления",
      );
    }

    const { type, groupMemberId, note, amount, splitBetween, expenseDate } =
      parsed.data;

    // Convert major amount to minor (kopecks)
    const amountMinor = Math.round(amount * 100);

    const expenseIndexBefore = await countExpensesInGroup(groupId);
    const splits = buildEqualSplitAmounts(
      amountMinor,
      splitBetween,
      expenseIndexBefore,
    );

    const result = await createExpenseWithSplits({
      groupId,
      type,
      groupMemberId,
      note,
      amountMinor,
      expenseDate,
      createdByUserId: session.userId,
      splits,
    });

    revalidateGroupData(groupId);

    return { ok: true, expenseId: result.expense.id };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return actionError("UNAUTHORIZED", "Требуется авторизация");
    }
    console.error("createExpense error:", err);
    return actionError("INTERNAL_ERROR", "Не удалось создать запись");
  }
}
