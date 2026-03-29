import type { ActionErrorCode } from "@/lib/errors/catalog";
import type { ApiError } from "@/lib/validation/common";

export function actionError(
  code: ActionErrorCode,
  message: string,
): ApiError {
  return { ok: false, error: { code, message } };
}

export function isApiError(
  result: { ok: boolean } | ApiError,
): result is ApiError {
  return result.ok === false;
}
