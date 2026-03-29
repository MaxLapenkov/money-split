/**
 * Коды ошибок server actions / API — единый справочник (см. documentation/technical/error-code-catalog.md).
 * UI ветвится по `code`, тексты `message` можно менять.
 */
export const ACTION_ERROR_CODES = [
  "UNAUTHORIZED",
  "INVALID_TELEGRAM_SIGNATURE",
  "INVALID_PAYLOAD",
  "GROUP_NOT_FOUND",
  "FORBIDDEN_GROUP_ACCESS",
  "GROUP_MEMBER_NOT_FOUND",
  "BINDING_ALREADY_EXISTS",
  "BINDING_CONFLICT",
  "INVITE_NOT_FOUND",
  "INVITE_EXPIRED",
  "INVITE_INVALID_FORMAT",
  "EXPENSE_NOT_FOUND",
  "INVALID_EXPENSE_PAYLOAD",
  "INVALID_EXPENSE_SPLITS",
  "SETTLEMENT_NOT_FOUND",
  "SETTLEMENT_ALREADY_PAID",
  "SETTLEMENT_INVALID_STATE",
  "VIEW_EVENT_NOT_FOUND",
  "ACKNOWLEDGE_INVALID_STATE",
  "VALIDATION_ERROR",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const;

export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];
