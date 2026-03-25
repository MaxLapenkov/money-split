"use server";

import type { ActionResult } from "@/lib/validation/common";
import type { CreateGroupInput } from "@/lib/validation/groups";
import { createGroupInputSchema } from "@/lib/validation/groups";

export async function createGroup(
  input: CreateGroupInput
): Promise<ActionResult<{ ok: true; groupId: string }>> {
  const parsed = createGroupInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid group payload" },
    };
  }

  // TODO: implement with Supabase in Phase 1
  return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented yet" } };
}
