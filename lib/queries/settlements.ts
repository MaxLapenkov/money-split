import { createServiceClient } from "@/lib/supabase/server";
import type { DbSettlement } from "@/lib/supabase/types";

type SettlementEdge = {
  from: string;
  to: string;
  amount: number;
};

function sortEdges(edges: SettlementEdge[]): SettlementEdge[] {
  return [...edges].sort(
    (a, b) =>
      a.from.localeCompare(b.from) ||
      a.to.localeCompare(b.to) ||
      a.amount - b.amount
  );
}

function edgesEqual(a: SettlementEdge[], b: SettlementEdge[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].from !== b[i].from ||
      a[i].to !== b[i].to ||
      a[i].amount !== b[i].amount
    ) {
      return false;
    }
  }
  return true;
}

export async function getSettlementsByGroupId(
  groupId: string
): Promise<DbSettlement[]> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("settlements")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbSettlement[];
}

export async function getSettlementById(
  settlementId: string
): Promise<DbSettlement | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("settlements")
    .select("*")
    .eq("id", settlementId)
    .maybeSingle();

  if (error) throw error;
  return data as DbSettlement | null;
}

export type UpsertSettlementsResult = {
  suggestedRows: DbSettlement[];
  /** true если были delete/insert suggested-строк */
  mutated: boolean;
};

export async function upsertSettlements(
  groupId: string,
  settlements: {
    fromGroupMemberId: string;
    toGroupMemberId: string;
    amountMinor: number;
  }[]
): Promise<UpsertSettlementsResult> {
  const sb = createServiceClient();

  const { data: existingRows, error: existingErr } = await sb
    .from("settlements")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "suggested");

  if (existingErr) throw existingErr;

  const desiredEdges = sortEdges(
    settlements.map((s) => ({
      from: s.fromGroupMemberId,
      to: s.toGroupMemberId,
      amount: s.amountMinor,
    }))
  );

  const currentEdges = sortEdges(
    (existingRows ?? []).map((r) => ({
      from: r.from_group_member_id as string,
      to: r.to_group_member_id as string,
      amount: Number(r.amount_minor),
    }))
  );

  // Keep stable row ids so "Оплачено" still works after router.refresh / revalidation
  if (edgesEqual(currentEdges, desiredEdges)) {
    return {
      suggestedRows: (existingRows ?? []) as DbSettlement[],
      mutated: false,
    };
  }

  const { error: delErr } = await sb
    .from("settlements")
    .delete()
    .eq("group_id", groupId)
    .eq("status", "suggested");

  if (delErr) throw delErr;

  if (settlements.length === 0) {
    return { suggestedRows: [], mutated: true };
  }

  const payload = settlements.map((s) => ({
    group_id: groupId,
    from_group_member_id: s.fromGroupMemberId,
    to_group_member_id: s.toGroupMemberId,
    amount_minor: s.amountMinor,
    status: "suggested" as const,
  }));

  const { data, error } = await sb
    .from("settlements")
    .insert(payload)
    .select();

  if (error) throw error;
  return {
    suggestedRows: (data ?? []) as DbSettlement[],
    mutated: true,
  };
}

export async function markSettlementPaid(
  settlementId: string
): Promise<DbSettlement> {
  const sb = createServiceClient();

  const { data: current, error: fetchErr } = await sb
    .from("settlements")
    .select("id, status")
    .eq("id", settlementId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!current) {
    throw new Error("SETTLEMENT_NOT_FOUND");
  }
  if (current.status !== "suggested") {
    throw new Error("SETTLEMENT_INVALID_STATE");
  }

  const { data, error } = await sb
    .from("settlements")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", settlementId)
    .eq("status", "suggested")
    .select()
    .single();

  if (error) throw error;
  return data as DbSettlement;
}
