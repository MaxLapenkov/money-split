import { z } from "zod";

export const participantInputSchema = z.object({
  displayName: z.string().min(1).max(80),
});

export type ParticipantInput = z.infer<typeof participantInputSchema>;

export const createGroupInputSchema = z.object({
  name: z.string().min(1).max(120),
  participants: z.array(participantInputSchema).min(2),
});

export type CreateGroupInput = z.infer<typeof createGroupInputSchema>;
