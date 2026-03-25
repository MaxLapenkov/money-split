import { z } from "zod";
import { MAX_EXPENSE_AMOUNT_MAJOR } from "@/lib/money";

export const createExpenseInputSchema = z.object({
  type: z.enum(["expense", "income"]),
  groupMemberId: z.string().uuid(),
  note: z.string().min(1).max(500),
  amount: z
    .number()
    .positive()
    .max(
      MAX_EXPENSE_AMOUNT_MAJOR,
      `Сумма не больше ${MAX_EXPENSE_AMOUNT_MAJOR.toLocaleString("ru-RU")} RUB`
    ),
  currency: z.literal("RUB"),
  splitBetween: z.array(z.string().uuid()).min(1),
  expenseDate: z.string(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

export const expenseListItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["expense", "income"]),
  groupMemberId: z.string().uuid(),
  groupMemberName: z.string(),
  note: z.string(),
  amountMinor: z.number(),
  currency: z.literal("RUB"),
  expenseDate: z.string(),
  createdAt: z.string(),
});

export type ExpenseListItem = z.infer<typeof expenseListItemSchema>;

export const expenseListResponseSchema = z.object({
  ok: z.literal(true),
  expenses: z.array(expenseListItemSchema),
});

export type ExpenseListResponse = z.infer<typeof expenseListResponseSchema>;
