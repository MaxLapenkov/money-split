import { createServiceClient } from "@/lib/supabase/server";
import type { DbInviteToken } from "@/lib/supabase/types";
import { randomBytes } from "crypto";

export async function createInviteToken(data: {
  groupId: string;
  createdBy: string;
}): Promise<DbInviteToken> {
  const sb = createServiceClient();
  const token = randomBytes(24).toString("base64url");

  const { data: invite, error } = await sb
    .from("invite_tokens")
    .insert({
      group_id: data.groupId,
      token,
      created_by: data.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return invite as DbInviteToken;
}

export async function resolveInviteToken(
  token: string
): Promise<DbInviteToken | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("invite_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return data as DbInviteToken | null;
}
