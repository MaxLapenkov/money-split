import { createServiceClient } from "@/lib/supabase/server";
import type { DbExpense, DbExpenseSplit } from "@/lib/supabase/types";

export async function createExpenseWithSplits(data: {
  groupId: string;
  type: "expense" | "income";
  groupMemberId: string;
  note: string;
  amountMinor: number;
  expenseDate: string;
  createdByUserId: string;
  splits: { groupMemberId: string; amountMinor: number }[];
}): Promise<{ expense: DbExpense; splits: DbExpenseSplit[] }> {
  const sb = createServiceClient();

  const { data: expense, error: expErr } = await sb
    .from("expenses")
    .insert({
      group_id: data.groupId,
      type: data.type,
      group_member_id: data.groupMemberId,
      note: data.note,
      amount_minor: data.amountMinor,
      currency: "RUB",
      expense_date: data.expenseDate,
      created_by_user_id: data.createdByUserId,
    })
    .select()
    .single();

  if (expErr) throw expErr;

  const splitsPayload = data.splits.map((s) => ({
    expense_id: expense.id,
    group_member_id: s.groupMemberId,
    amount_minor: s.amountMinor,
  }));

  const { data: splits, error: splitErr } = await sb
    .from("expense_splits")
    .insert(splitsPayload)
    .select();

  if (splitErr) throw splitErr;

  return {
    expense: expense as DbExpense,
    splits: (splits ?? []) as DbExpenseSplit[],
  };
}

export async function getLatestExpenseIdForGroup(
  groupId: string
): Promise<string | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("expenses")
    .select("id")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.id as string | undefined) ?? null;
}

export async function getExpensesByGroupId(
  groupId: string
): Promise<DbExpense[]> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("expenses")
    .select("*")
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbExpense[];
}

export async function getExpenseSplits(
  expenseId: string
): Promise<DbExpenseSplit[]> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("expense_splits")
    .select("*")
    .eq("expense_id", expenseId);

  if (error) throw error;
  return (data ?? []) as DbExpenseSplit[];
}

export async function getSplitsByGroupId(
  groupId: string
): Promise<DbExpenseSplit[]> {
  const sb = createServiceClient();

  const { data: expenses, error: expErr } = await sb
    .from("expenses")
    .select("id")
    .eq("group_id", groupId);

  if (expErr) throw expErr;
  if (!expenses || expenses.length === 0) return [];

  const expenseIds = expenses.map((e) => e.id);

  const { data: splits, error: splitErr } = await sb
    .from("expense_splits")
    .select("*")
    .in("expense_id", expenseIds);

  if (splitErr) throw splitErr;
  return (splits ?? []) as DbExpenseSplit[];
}
