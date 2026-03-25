import { createHmac } from "crypto";

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60; // 24 hours

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface ValidatedTelegramData {
  user: TelegramUser;
  authDate: number;
  queryId?: string;
  hash: string;
}

export function validateInitData(
  initData: string,
  botToken: string
): ValidatedTelegramData {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    throw new TelegramAuthError("MISSING_HASH", "hash field is missing");
  }

  const authDateStr = params.get("auth_date");
  if (!authDateStr) {
    throw new TelegramAuthError(
      "MISSING_AUTH_DATE",
      "auth_date field is missing"
    );
  }

  const authDate = parseInt(authDateStr, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > MAX_AUTH_AGE_SECONDS) {
    throw new TelegramAuthError("EXPIRED", "initData is too old");
  }

  const userStr = params.get("user");
  if (!userStr) {
    throw new TelegramAuthError("MISSING_USER", "user field is missing");
  }

  // Build data_check_string: sorted key=value pairs excluding hash, joined by \n
  const entries: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash") {
      entries.push(`${key}=${value}`);
    }
  });
  entries.sort();
  const dataCheckString = entries.join("\n");

  // secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  // computed_hash = HMAC_SHA256(secret_key, data_check_string)
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    throw new TelegramAuthError(
      "INVALID_SIGNATURE",
      "Telegram initData validation failed"
    );
  }

  let user: TelegramUser;
  try {
    user = JSON.parse(userStr);
  } catch {
    throw new TelegramAuthError("INVALID_USER", "Cannot parse user JSON");
  }

  return {
    user,
    authDate,
    queryId: params.get("query_id") ?? undefined,
    hash,
  };
}

export class TelegramAuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "TelegramAuthError";
  }
}
