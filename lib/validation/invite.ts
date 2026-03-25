import { z } from "zod";

export const resolveInviteInputSchema = z.object({
  inviteToken: z.string().min(8).max(256),
});

export type ResolveInviteInput = z.infer<typeof resolveInviteInputSchema>;

export const resolveInviteSuccessSchema = z.object({
  ok: z.literal(true),
  groupId: z.string().uuid(),
});

export type ResolveInviteSuccess = z.infer<typeof resolveInviteSuccessSchema>;

export const bindParticipantInputSchema = z.object({
  groupMemberId: z.string().uuid(),
});

export type BindParticipantInput = z.infer<typeof bindParticipantInputSchema>;

export const myParticipantResponseSchema = z.object({
  ok: z.literal(true),
  groupMemberId: z.string().uuid().nullable(),
});

export type MyParticipantResponse = z.infer<typeof myParticipantResponseSchema>;
