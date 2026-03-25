"use server";

import type { ActionResult } from "@/lib/validation/common";
import type { CreateExpenseInput } from "@/lib/validation/expenses";
import { createExpenseInputSchema } from "@/lib/validation/expenses";

export async function createExpense(
  input: CreateExpenseInput
): Promise<ActionResult<{ ok: true; expenseId: string }>> {
  const parsed = createExpenseInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid expense payload" },
    };
  }

  // TODO: implement with Supabase in Phase 1
  return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented yet" } };
}
