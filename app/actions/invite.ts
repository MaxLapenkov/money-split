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

export async function resolveInvite(
  input: ResolveInviteInput
): Promise<ActionResult<ResolveInviteSuccess>> {
  const parsed = resolveInviteInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid invite payload" },
    };
  }

  // TODO: implement invite token resolution in Phase 3
  return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented yet" } };
}

export async function bindParticipant(
  groupId: string,
  input: BindParticipantInput
): Promise<ActionResult<MyParticipantResponse>> {
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

  // TODO: implement participant binding in Phase 3
  return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented yet" } };
}
