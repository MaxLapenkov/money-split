"use server";

import { actionError } from "@/lib/errors/action-result";
import type { ActionResult } from "@/lib/validation/common";
import type {
  ResolveInviteInput,
  ResolveInviteSuccess,
  BindParticipantInput,
  MyParticipantResponse,
} from "@/lib/validation/invite";
import {
  resolveInviteInputSchema,
  bindParticipantInputSchema,
} from "@/lib/validation/invite";
import { requireSession, AuthRequiredError } from "@/lib/auth/require-session";
import {
  revalidateGroupData,
  revalidateUserGroupsList,
} from "@/lib/cache/revalidate";
import {
  resolveInviteToken,
  createInviteToken,
} from "@/lib/queries/invite";
import {
  createBinding,
  getBindingForUser,
} from "@/lib/queries/bindings";
import { getGroupMember } from "@/lib/queries/groups";
import { getLatestExpenseIdForGroup } from "@/lib/queries/expenses";
import { recordInitialGroupView } from "@/lib/queries/view-events";

export async function resolveInvite(
  input: ResolveInviteInput
): Promise<ActionResult<ResolveInviteSuccess>> {
  try {
    const parsed = resolveInviteInputSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("INVALID_PAYLOAD", "Некорректные данные приглашения");
    }

    const invite = await resolveInviteToken(parsed.data.inviteToken);
    if (!invite) {
      return actionError("INVITE_NOT_FOUND", "Ссылка приглашения недействительна");
    }

    return { ok: true, groupId: invite.group_id };
  } catch (err) {
    console.error("resolveInvite error:", err);
    return actionError("INTERNAL_ERROR", "Не удалось обработать приглашение");
  }
}

export async function generateInvite(
  groupId: string
): Promise<ActionResult<{ ok: true; inviteToken: string }>> {
  try {
    const session = await requireSession();

    const invite = await createInviteToken({
      groupId,
      createdBy: session.userId,
    });

    return { ok: true, inviteToken: invite.token };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return actionError("UNAUTHORIZED", "Требуется авторизация");
    }
    console.error("generateInvite error:", err);
    return actionError("INTERNAL_ERROR", "Не удалось создать ссылку приглашения");
  }
}

export async function bindParticipant(
  groupId: string,
  input: BindParticipantInput
): Promise<ActionResult<MyParticipantResponse>> {
  try {
    const session = await requireSession();

    const parsed = bindParticipantInputSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("VALIDATION_ERROR", "Проверьте выбор участника");
    }

    // Check if user already has a binding in this group
    const existing = await getBindingForUser(groupId, session.userId);
    if (existing) {
      return { ok: true, groupMemberId: existing.group_member_id };
    }

    const targetMember = await getGroupMember(
      groupId,
      parsed.data.groupMemberId
    );
    if (!targetMember) {
      return actionError("GROUP_MEMBER_NOT_FOUND", "Участник не найден в группе");
    }
    if (targetMember.role === "owner") {
      return actionError(
        "VALIDATION_ERROR",
        "Нельзя выбрать организатора по приглашению",
      );
    }

    const binding = await createBinding({
      groupId,
      groupMemberId: parsed.data.groupMemberId,
      userId: session.userId,
    });

    const lastExpenseId = await getLatestExpenseIdForGroup(groupId);
    await recordInitialGroupView({
      groupId,
      userId: session.userId,
      groupMemberId: binding.group_member_id,
      lastSeenExpenseId: lastExpenseId,
    });

    revalidateGroupData(groupId);
    revalidateUserGroupsList(session.userId);

    return { ok: true, groupMemberId: binding.group_member_id };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return actionError("UNAUTHORIZED", "Требуется авторизация");
    }

    const message =
      err instanceof Error ? err.message : "Failed to bind participant";
    const isConflict = message.includes("unique") || message.includes("duplicate");

    if (isConflict) {
      return actionError(
        "BINDING_CONFLICT",
        "Этот участник уже привязан к другому пользователю",
      );
    }
    return actionError("INTERNAL_ERROR", "Не удалось сохранить привязку");
  }
}

export async function getMyParticipant(
  groupId: string
): Promise<ActionResult<MyParticipantResponse>> {
  try {
    const session = await requireSession();

    const binding = await getBindingForUser(groupId, session.userId);

    return {
      ok: true,
      groupMemberId: binding?.group_member_id ?? null,
    };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return actionError("UNAUTHORIZED", "Требуется авторизация");
    }
    console.error("getMyParticipant error:", err);
    return actionError("INTERNAL_ERROR", "Не удалось получить данные участника");
  }
}
