"use server";

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
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid invite payload" },
      };
    }

    const invite = await resolveInviteToken(parsed.data.inviteToken);
    if (!invite) {
      return {
        ok: false,
        error: { code: "INVITE_NOT_FOUND", message: "Invalid invite link" },
      };
    }

    return { ok: true, groupId: invite.group_id };
  } catch (err) {
    console.error("resolveInvite error:", err);
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to resolve invite" },
    };
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
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }
    console.error("generateInvite error:", err);
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to generate invite" },
    };
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
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid binding payload",
        },
      };
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
    if (!targetMember || targetMember.role === "owner") {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Нельзя выбрать организатора по приглашению",
        },
      };
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

    return { ok: true, groupMemberId: binding.group_member_id };
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }

    const message =
      err instanceof Error ? err.message : "Failed to bind participant";
    const isConflict = message.includes("unique") || message.includes("duplicate");

    return {
      ok: false,
      error: {
        code: isConflict ? "BINDING_CONFLICT" : "INTERNAL_ERROR",
        message: isConflict
          ? "This participant is already bound to another user"
          : "Failed to bind participant",
      },
    };
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
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      };
    }
    console.error("getMyParticipant error:", err);
    return {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get participant",
      },
    };
  }
}
