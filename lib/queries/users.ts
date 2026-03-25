import { createServiceClient } from "@/lib/supabase/server";
import type { DbUser } from "@/lib/supabase/types";

export async function upsertUser(data: {
  telegramId: string;
  username: string | null;
  displayName: string;
}): Promise<DbUser> {
  const sb = createServiceClient();

  const { data: user, error } = await sb
    .from("users")
    .upsert(
      {
        telegram_id: data.telegramId,
        username: data.username,
        display_name: data.displayName,
      },
      { onConflict: "telegram_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return user as DbUser;
}

export async function getUserByTelegramId(
  telegramId: string
): Promise<DbUser | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (error) throw error;
  return data as DbUser | null;
}

export async function getUserById(userId: string): Promise<DbUser | null> {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as DbUser | null;
}
