"use server";

import type { ActionResult } from "@/lib/validation/common";
import { revalidateGroupData } from "@/lib/cache/revalidate";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import { getBindingForUser } from "@/lib/queries/bindings";
import { acknowledgeViewEvent } from "@/lib/queries/view-events";

export async function acknowledgeGroupAction(
  groupId: string
): Promise<ActionResult<{ ok: true }>> {
  try {
    const session = await requireSession();
    const binding = await getBindingForUser(groupId, session.userId);
    await acknowledgeViewEvent(
      groupId,
      session.userId,
      binding?.group_member_id ?? null
    );
    revalidateGroupData(groupId);
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }
    console.error("acknowledgeGroupAction error:", err);
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to acknowledge" },
    };
  }
}
