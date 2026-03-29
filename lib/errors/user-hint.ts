import type { ActionErrorCode } from "@/lib/errors/catalog";

/**
 * Подсказка для toast: по умолчанию — `message` с сервера;
 * для частых кодов — стабильная короткая фраза (опционально).
 */
export function actionErrorHint(
  code: ActionErrorCode,
  message: string,
): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "Необходима авторизация";
    case "INTERNAL_ERROR":
      return "Произошла ошибка. Попробуйте позже.";
    default:
      return message;
  }
}
