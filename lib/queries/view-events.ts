import { createServiceClient } from "@/lib/supabase/server";
import type { DbGroupViewEvent } from "@/lib/supabase/types";
import { getLatestExpenseIdForGroup } from "@/lib/queries/expenses";

export async function getViewEventForUser(
  groupId: string,
  userId: string
): Promise<DbGroupViewEvent | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("group_view_events")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as DbGroupViewEvent | null;
}

/**
 * First binding / join: record `viewed` once. Does not reset `viewed_at` on repeat calls.
 * If `lastSeenExpenseId` omitted on insert, loads latest expense for the group.
 */
export async function recordInitialGroupView(data: {
  groupId: string;
  userId: string;
  groupMemberId: string;
  lastSeenExpenseId?: string | null;
}): Promise<DbGroupViewEvent> {
  const sb = createServiceClient();

  const existing = await getViewEventForUser(data.groupId, data.userId);
  if (existing) {
    if (!existing.group_member_id && data.groupMemberId) {
      const { data: updated, error } = await sb
        .from("group_view_events")
        .update({
          group_member_id: data.groupMemberId,
          last_seen_expense_id:
            data.lastSeenExpenseId ?? existing.last_seen_expense_id,
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return updated as DbGroupViewEvent;
    }
    return existing;
  }

  const lastSeen =
    data.lastSeenExpenseId !== undefined
      ? data.lastSeenExpenseId
      : await getLatestExpenseIdForGroup(data.groupId);

  const { data: inserted, error } = await sb
    .from("group_view_events")
    .insert({
      group_id: data.groupId,
      user_id: data.userId,
      group_member_id: data.groupMemberId,
      status: "viewed",
      viewed_at: new Date().toISOString(),
      last_seen_expense_id: lastSeen,
    })
    .select()
    .single();

  if (error) throw error;
  return inserted as DbGroupViewEvent;
}

export async function acknowledgeViewEvent(
  groupId: string,
  userId: string,
  groupMemberId: string | null
): Promise<DbGroupViewEvent> {
  const sb = createServiceClient();

  const existing = await getViewEventForUser(groupId, userId);
  const now = new Date().toISOString();

  if (!existing) {
    const { data: inserted, error } = await sb
      .from("group_view_events")
      .insert({
        group_id: groupId,
        user_id: userId,
        group_member_id: groupMemberId,
        status: "acknowledged",
        viewed_at: now,
        acknowledged_at: now,
      })
      .select()
      .single();

    if (error) throw error;
    return inserted as DbGroupViewEvent;
  }

  if (existing.status === "acknowledged") {
    return existing;
  }

  const { data: updated, error } = await sb
    .from("group_view_events")
    .update({
      status: "acknowledged",
      acknowledged_at: now,
    })
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return updated as DbGroupViewEvent;
}

export async function getViewEventsForGroup(
  groupId: string
): Promise<DbGroupViewEvent[]> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("group_view_events")
    .select("*")
    .eq("group_id", groupId);

  if (error) throw error;
  return (data ?? []) as DbGroupViewEvent[];
}
