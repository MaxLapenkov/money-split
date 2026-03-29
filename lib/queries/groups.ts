import { createServiceClient } from "@/lib/supabase/server";
import type { DbGroup, DbGroupMember } from "@/lib/supabase/types";
import type { GroupMemberRole } from "@/lib/supabase/types";

export async function createGroup(data: {
  name: string;
  createdBy: string;
  participants: { displayName: string; role: GroupMemberRole }[];
}): Promise<{ group: DbGroup; members: DbGroupMember[] }> {
  const sb = createServiceClient();

  const { data: group, error: groupErr } = await sb
    .from("groups")
    .insert({ name: data.name, created_by: data.createdBy })
    .select()
    .single();

  if (groupErr) throw groupErr;

  const membersPayload = data.participants.map((p) => ({
    group_id: group.id,
    display_name: p.displayName,
    role: p.role,
  }));

  const { data: members, error: membersErr } = await sb
    .from("group_members")
    .insert(membersPayload)
    .select();

  if (membersErr) throw membersErr;

  return {
    group: group as DbGroup,
    members: members as DbGroupMember[],
  };
}

export async function getGroupById(
  groupId: string
): Promise<DbGroup | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw error;
  return data as DbGroup | null;
}

export async function getGroupMember(
  groupId: string,
  memberId: string
): Promise<DbGroupMember | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("id", memberId)
    .maybeSingle();

  if (error) throw error;
  return data as DbGroupMember | null;
}

export async function getGroupMembers(
  groupId: string
): Promise<DbGroupMember[]> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbGroupMember[];
}

export async function getGroupsByUserId(
  userId: string
): Promise<DbGroup[]> {
  const sb = createServiceClient();

  // Groups the user created
  const { data: ownedGroups, error: ownedErr } = await sb
    .from("groups")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (ownedErr) throw ownedErr;

  // Groups the user joined via binding
  const { data: bindings, error: bindErr } = await sb
    .from("group_participant_bindings")
    .select("group_id")
    .eq("user_id", userId);

  if (bindErr) throw bindErr;

  const boundGroupIds = (bindings ?? [])
    .map((b) => b.group_id as string)
    .filter(
      (gid) => !(ownedGroups ?? []).some((g) => g.id === gid)
    );

  if (boundGroupIds.length === 0) {
    return (ownedGroups ?? []) as DbGroup[];
  }

  const { data: boundGroups, error: boundErr } = await sb
    .from("groups")
    .select("*")
    .in("id", boundGroupIds)
    .order("created_at", { ascending: false });

  if (boundErr) throw boundErr;

  const all = [...(ownedGroups ?? []), ...(boundGroups ?? [])] as DbGroup[];
  all.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return all;
}

/** Удаляет группу только если пользователь — создатель (организатор). */
export async function deleteGroupForUser(
  groupId: string,
  userId: string
): Promise<boolean> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("groups")
    .delete()
    .eq("id", groupId)
    .eq("created_by", userId)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
