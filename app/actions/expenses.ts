"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/validation/common";
import type { CreateExpenseInput } from "@/lib/validation/expenses";
import { createExpenseInputSchema } from "@/lib/validation/expenses";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import { createExpenseWithSplits } from "@/lib/queries/expenses";

export async function createExpense(
  groupId: string,
  input: CreateExpenseInput
): Promise<ActionResult<{ ok: true; expenseId: string }>> {
  try {
    const session = await requireSession();

    const parsed = createExpenseInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid expense payload",
        },
      };
    }

    const { type, groupMemberId, note, amount, splitBetween, expenseDate } =
      parsed.data;

    // Convert major amount to minor (kopecks)
    const amountMinor = Math.round(amount * 100);

    // Equal split among participants
    const splitBase = Math.floor(amountMinor / splitBetween.length);
    const remainder = amountMinor - splitBase * splitBetween.length;

    const splits = splitBetween.map((memberId, i) => ({
      groupMemberId: memberId,
      amountMinor: splitBase + (i < remainder ? 1 : 0),
    }));

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

    revalidatePath(`/groups/${groupId}`);

    return { ok: true, expenseId: result.expense.id };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }
    console.error("createExpense error:", err);
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create expense" },
    };
  }
}
