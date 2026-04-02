import { NextRequest, NextResponse } from "next/server";
import { getTelegramMiniAppDeepLink } from "@/lib/telegram/mini-app-link";

const TG_API = "https://api.telegram.org";

type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return true;
  }
  const header = request.headers.get("X-Telegram-Bot-Api-Secret-Token")?.trim();
  if (header === secret) {
    return true;
  }
  if (!header) {
    console.warn(
      "telegram webhook: TELEGRAM_WEBHOOK_SECRET is set but X-Telegram-Bot-Api-Secret-Token is missing. Call setWebhook with secret_token equal to TELEGRAM_WEBHOOK_SECRET, or unset TELEGRAM_WEBHOOK_SECRET.",
    );
  } else {
    console.warn("telegram webhook: secret token does not match TELEGRAM_WEBHOOK_SECRET");
  }
  return false;
}

async function sendWelcomeMessage(chatId: number): Promise<void> {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error("telegram webhook: BOT_TOKEN is not set");
    return;
  }

  let appLink: string;
  try {
    appLink = getTelegramMiniAppDeepLink();
  } catch (e) {
    console.error("telegram webhook: mini app link", e);
    return;
  }

  const text =
    "Привет! Это Money Split — приложение для учёта совместных расходов.\n\n" +
    "Нажмите кнопку ниже, чтобы открыть Mini App.";

  const body = {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть Money Split",
            url: appLink,
          },
        ],
      ],
    },
  };

  const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("telegram sendMessage failed:", res.status, errText);
  }
}

function isPrivateStart(update: TelegramUpdate): boolean {
  const msg = update.message;
  if (!msg || msg.chat.type !== "private") {
    return false;
  }
  const text = msg.text?.trim() ?? "";
  return text === "/start" || text.startsWith("/start ");
}

export async function POST(request: NextRequest) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (isPrivateStart(update) && update.message) {
    await sendWelcomeMessage(update.message.chat.id);
  }

  return NextResponse.json({ ok: true });
}
