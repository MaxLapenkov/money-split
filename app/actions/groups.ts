"use server";

import { redirect } from "next/navigation";
import { actionError } from "@/lib/errors/action-result";
import type { ActionResult } from "@/lib/validation/common";
import {
  revalidateGroupData,
  revalidateUserGroupsList,
} from "@/lib/cache/revalidate";
import type { CreateGroupInput } from "@/lib/validation/groups";
import { createGroupInputSchema } from "@/lib/validation/groups";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import {
  createGroup as dbCreateGroup,
  deleteGroupForUser,
} from "@/lib/queries/groups";
import { createBinding } from "@/lib/queries/bindings";
import { recordInitialGroupView } from "@/lib/queries/view-events";

export async function createGroup(
  input: CreateGroupInput
): Promise<ActionResult<{ ok: true; groupId: string }>> {
  try {
    const session = await requireSession();

    const parsed = createGroupInputSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("VALIDATION_ERROR", "Проверьте данные группы");
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
      return actionError("UNAUTHORIZED", "Требуется авторизация");
    }
    console.error("createGroup error:", err);
    return actionError("INTERNAL_ERROR", "Не удалось создать группу");
  }
}

export async function deleteGroup(
  groupId: string
): Promise<ActionResult<{ ok: true }>> {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return actionError("UNAUTHORIZED", "Требуется авторизация");
    }
    throw err;
  }

  let deleted: boolean;
  try {
    deleted = await deleteGroupForUser(groupId, session.userId);
  } catch (err) {
    console.error("deleteGroup error:", err);
    return actionError("INTERNAL_ERROR", "Не удалось удалить группу");
  }

  if (!deleted) {
    return actionError(
      "FORBIDDEN_GROUP_ACCESS",
      "Только организатор может удалить группу",
    );
  }

  try {
    revalidateGroupData(groupId);
    revalidateUserGroupsList(session.userId);
  } catch (err) {
    console.error("deleteGroup revalidate error:", err);
  }

  redirect("/");
}
