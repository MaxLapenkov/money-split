import { z } from "zod";

export const authTelegramInputSchema = z.object({
  initData: z.string().min(1),
});

export type AuthTelegramInput = z.infer<typeof authTelegramInputSchema>;

export const authTelegramSuccessSchema = z.object({
  ok: z.literal(true),
  userId: z.string().uuid(),
});

export type AuthTelegramSuccess = z.infer<typeof authTelegramSuccessSchema>;
