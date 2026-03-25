import type { DbExpense, DbExpenseSplit, DbGroupMember } from "@/lib/supabase/types";

export interface Balance {
  groupMemberId: string;
  displayName: string;
  netMinor: number; // positive = owed to them, negative = they owe
}

export interface SettlementSuggestion {
  fromGroupMemberId: string;
  fromName: string;
  toGroupMemberId: string;
  toName: string;
  amountMinor: number;
}

export function calculateBalances(
  members: DbGroupMember[],
  expenses: DbExpense[],
  splits: DbExpenseSplit[]
): Balance[] {
  const net = new Map<string, number>(members.map((m) => [m.id, 0]));

  for (const expense of expenses) {
    const amount =
      expense.type === "expense" ? expense.amount_minor : -expense.amount_minor;

    // The payer receives credit (expense) or owes (income)
    net.set(expense.group_member_id, (net.get(expense.group_member_id) ?? 0) + amount);

    // Each split participant owes their share
    const expSplits = splits.filter((s) => s.expense_id === expense.id);
    for (const split of expSplits) {
      net.set(split.group_member_id, (net.get(split.group_member_id) ?? 0) - split.amount_minor);
    }
  }

  const nameMap = new Map(members.map((m) => [m.id, m.display_name]));

  return members.map((m) => ({
    groupMemberId: m.id,
    displayName: nameMap.get(m.id) ?? m.id,
    netMinor: net.get(m.id) ?? 0,
  }));
}

/**
 * Sum of netMinor must be 0 when splits fully cover each expense (integer kopecks).
 */
export function netBalancesSumToZero(balances: Balance[]): boolean {
  const sum = balances.reduce((s, b) => s + b.netMinor, 0);
  return sum === 0;
}

/** One completed transfer (DB `paid` row). Adjusts nets so greedy sees remaining debt. */
export interface PaidSettlementEdge {
  fromGroupMemberId: string;
  toGroupMemberId: string;
  amountMinor: number;
}

/**
 * Subtract effect of already paid settlements from expense-derived balances.
 * `from` owed → paying increases their net; `to` was owed → receiving payment decreases their net.
 */
export function applyPaidSettlementsToBalances(
  balances: Balance[],
  paid: PaidSettlementEdge[]
): Balance[] {
  if (paid.length === 0) return balances;
  const net = new Map(balances.map((b) => [b.groupMemberId, b.netMinor]));
  for (const p of paid) {
    net.set(
      p.fromGroupMemberId,
      (net.get(p.fromGroupMemberId) ?? 0) + p.amountMinor
    );
    net.set(
      p.toGroupMemberId,
      (net.get(p.toGroupMemberId) ?? 0) - p.amountMinor
    );
  }
  return balances.map((b) => ({
    ...b,
    netMinor: net.get(b.groupMemberId) ?? 0,
  }));
}

export function calculateSettlements(balances: Balance[]): SettlementSuggestion[] {
  const debtors = balances
    .filter((b) => b.netMinor < 0)
    .map((b) => ({ ...b, amount: -b.netMinor }))
    .sort((a, b) => b.amount - a.amount || a.groupMemberId.localeCompare(b.groupMemberId));

  const creditors = balances
    .filter((b) => b.netMinor > 0)
    .map((b) => ({ ...b, amount: b.netMinor }))
    .sort((a, b) => b.amount - a.amount || a.groupMemberId.localeCompare(b.groupMemberId));

  const result: SettlementSuggestion[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const transfer = Math.min(debtors[d].amount, creditors[c].amount);
    if (transfer > 0) {
      result.push({
        fromGroupMemberId: debtors[d].groupMemberId,
        fromName: debtors[d].displayName,
        toGroupMemberId: creditors[c].groupMemberId,
        toName: creditors[c].displayName,
        amountMinor: transfer,
      });
    }
    debtors[d].amount -= transfer;
    creditors[c].amount -= transfer;
    if (debtors[d].amount === 0) d++;
    if (creditors[c].amount === 0) c++;
  }

  return result;
}
