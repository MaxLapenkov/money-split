import { createServiceClient } from "@/lib/supabase/server";
import type { DbSettlement } from "@/lib/supabase/types";

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

export async function upsertSettlements(
  groupId: string,
  settlements: {
    fromGroupMemberId: string;
    toGroupMemberId: string;
    amountMinor: number;
  }[]
): Promise<DbSettlement[]> {
  const sb = createServiceClient();

  // Delete existing suggested settlements for this group before recalculating
  await sb
    .from("settlements")
    .delete()
    .eq("group_id", groupId)
    .eq("status", "suggested");

  if (settlements.length === 0) return [];

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
  return (data ?? []) as DbSettlement[];
}

export async function markSettlementPaid(
  settlementId: string
): Promise<DbSettlement> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("settlements")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", settlementId)
    .select()
    .single();

  if (error) throw error;
  return data as DbSettlement;
}
