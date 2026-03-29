import { z } from "zod";
import type { ActionErrorCode } from "@/lib/errors/catalog";

export const apiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiError = {
  ok: false;
  error: { code: ActionErrorCode; message: string };
};

export type ActionResult<T> = T | ApiError;
