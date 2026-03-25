import { after } from "next/server";
import { revalidateGroupDataCache } from "@/lib/cache/revalidate";
import { upsertSettlements } from "@/lib/queries/settlements";
import type {
  DbExpense,
  DbExpenseSplit,
  DbGroupMember,
  DbSettlement,
} from "@/lib/supabase/types";
import {
  applyPaidSettlementsToBalances,
  calculateBalances,
  calculateSettlements,
  netBalancesSumToZero,
  type Balance,
} from "@/lib/settlement";

export type ResolveGroupSettlementsInput = {
  groupId: string;
  currency: string;
  members: DbGroupMember[];
  expenses: DbExpense[];
  splits: DbExpenseSplit[];
  settlementsSnapshot: DbSettlement[];
};

export type ResolveGroupSettlementsResult = {
  dbSettlements: DbSettlement[];
  balancesAfterPaid: Balance[];
};

export async function resolveGroupSettlementsDisplay({
  groupId,
  currency,
  members,
  expenses,
  splits,
  settlementsSnapshot,
}: ResolveGroupSettlementsInput): Promise<ResolveGroupSettlementsResult> {
  const balances = calculateBalances(members, expenses, splits);
  const paidEdges = settlementsSnapshot
    .filter((s) => s.status === "paid")
    .map((s) => ({
      fromGroupMemberId: s.from_group_member_id,
      toGroupMemberId: s.to_group_member_id,
      amountMinor: s.amount_minor,
    }));
  const balancesAfterPaid = applyPaidSettlementsToBalances(balances, paidEdges);
  const suggestions = calculateSettlements(balancesAfterPaid);

  const paidSettlementRows = settlementsSnapshot.filter(
    (s) => s.status === "paid",
  );

  let dbSettlements: DbSettlement[];

  if (currency === "RUB" && netBalancesSumToZero(balances)) {
    const { suggestedRows, mutated } = await upsertSettlements(
      groupId,
      suggestions.map((s) => ({
        fromGroupMemberId: s.fromGroupMemberId,
        toGroupMemberId: s.toGroupMemberId,
        amountMinor: s.amountMinor,
      })),
    );

    if (mutated) {
      after(() => {
        revalidateGroupDataCache(groupId);
      });
    }
    dbSettlements = [...paidSettlementRows, ...suggestedRows].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else {
    dbSettlements = settlementsSnapshot;
  }

  return { dbSettlements, balancesAfterPaid };
}
