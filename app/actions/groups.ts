"use server";

import type { ActionResult } from "@/lib/validation/common";
import {
  revalidateGroupData,
  revalidateUserGroupsList,
} from "@/lib/cache/revalidate";
import type { CreateGroupInput } from "@/lib/validation/groups";
import { createGroupInputSchema } from "@/lib/validation/groups";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import { createGroup as dbCreateGroup } from "@/lib/queries/groups";
import { createBinding } from "@/lib/queries/bindings";
import { recordInitialGroupView } from "@/lib/queries/view-events";

export async function createGroup(
  input: CreateGroupInput
): Promise<ActionResult<{ ok: true; groupId: string }>> {
  try {
    const session = await requireSession();

    const parsed = createGroupInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid group payload" },
      };
    }

    const { name, participants } = parsed.data;

    const result = await dbCreateGroup({
      name,
      createdBy: session.userId,
      participants: participants.map((p, i) => ({
        displayName: p.displayName,
        role: i === 0 ? "owner" : "member",
      })),
    });

    // Auto-bind the creator to the first participant (owner)
    const ownerMember = result.members.find((m) => m.role === "owner");
    if (ownerMember) {
      await createBinding({
        groupId: result.group.id,
        groupMemberId: ownerMember.id,
        userId: session.userId,
      });
      await recordInitialGroupView({
        groupId: result.group.id,
        userId: session.userId,
        groupMemberId: ownerMember.id,
        lastSeenExpenseId: null,
      });
    }

    revalidateUserGroupsList(session.userId);
    revalidateGroupData(result.group.id);

    return { ok: true, groupId: result.group.id };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }
    console.error("createGroup error:", err);
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create group" },
    };
  }
}
