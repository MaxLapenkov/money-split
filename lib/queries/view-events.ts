import { createServiceClient } from "@/lib/supabase/server";
import type { DbGroupViewEvent } from "@/lib/supabase/types";

export async function upsertViewEvent(data: {
  groupId: string;
  userId: string;
  groupMemberId: string | null;
  lastSeenExpenseId: string | null;
}): Promise<DbGroupViewEvent> {
  const sb = createServiceClient();

  const { data: event, error } = await sb
    .from("group_view_events")
    .upsert(
      {
        group_id: data.groupId,
        user_id: data.userId,
        group_member_id: data.groupMemberId,
        status: "viewed",
        viewed_at: new Date().toISOString(),
        last_seen_expense_id: data.lastSeenExpenseId,
      },
      { onConflict: "group_id,user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return event as DbGroupViewEvent;
}

export async function acknowledgeViewEvent(
  groupId: string,
  userId: string
): Promise<DbGroupViewEvent> {
  const sb = createServiceClient();

  const { data: event, error } = await sb
    .from("group_view_events")
    .update({
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
    })
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return event as DbGroupViewEvent;
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
