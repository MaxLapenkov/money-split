import { createServiceClient } from "@/lib/supabase/server";
import type { DbGroupParticipantBinding } from "@/lib/supabase/types";

export async function getBindingForUser(
  groupId: string,
  userId: string
): Promise<DbGroupParticipantBinding | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("group_participant_bindings")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as DbGroupParticipantBinding | null;
}

export async function createBinding(data: {
  groupId: string;
  groupMemberId: string;
  userId: string;
}): Promise<DbGroupParticipantBinding> {
  const sb = createServiceClient();

  const { data: binding, error } = await sb
    .from("group_participant_bindings")
    .insert({
      group_id: data.groupId,
      group_member_id: data.groupMemberId,
      user_id: data.userId,
    })
    .select()
    .single();

  if (error) throw error;
  return binding as DbGroupParticipantBinding;
}

export async function getBindingsForGroup(
  groupId: string
): Promise<DbGroupParticipantBinding[]> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("group_participant_bindings")
    .select("*")
    .eq("group_id", groupId);

  if (error) throw error;
  return (data ?? []) as DbGroupParticipantBinding[];
}
