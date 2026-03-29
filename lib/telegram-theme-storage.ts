/**
 * Ключ localStorage для зеркала Telegram colorScheme.
 * Должен совпадать с inline-скриптом в app/layout.tsx.
 */
export const TELEGRAM_THEME_STORAGE_KEY = "theme" as const;

export type TelegramThemeStorageValue = "dark" | "light";
