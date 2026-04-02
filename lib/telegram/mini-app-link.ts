/**
 * Deep link to open the Mini App from Telegram (chat button, messages).
 * Format: https://t.me/<bot_username>/<app_shortname>[?startapp=...]
 */
export function getTelegramMiniAppDeepLink(startapp?: string): string {
  const username = process.env.NEXT_PUBLIC_BOT_USERNAME;
  const shortname = process.env.NEXT_PUBLIC_APP_SHORTNAME;
  if (!username || !shortname) {
    throw new Error(
      "NEXT_PUBLIC_BOT_USERNAME and NEXT_PUBLIC_APP_SHORTNAME must be set",
    );
  }
  const base = `https://t.me/${username}/${shortname}`;
  if (startapp) {
    const params = new URLSearchParams({ startapp });
    return `${base}?${params.toString()}`;
  }
  return base;
}
